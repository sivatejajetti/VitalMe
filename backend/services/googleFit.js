const { google } = require('googleapis');

/**
 * Google Fit Service
 * Handles data fetching and aggregation from the Google Fitness API
 */
class GoogleFitService {
  constructor(tokens) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.oauth2Client.setCredentials(tokens);
    this.fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Fetches aggregated data for a specific duration
   * @param {number} startTimeMillis 
   * @param {number} endTimeMillis 
   * @param {string} dataType 
   */
  async getAggregatedData(startTimeMillis, endTimeMillis, dataType) {
    try {
      const response = await this.fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [{ dataTypeName: dataType }],
          bucketByTime: { durationMillis: (endTimeMillis - startTimeMillis).toString() },
          startTimeMillis,
          endTimeMillis,
        },
      });
      return response.data.bucket;
    } catch (error) {
      // Graceful error handling for missing data sources
      return [];
    }
  }

  async getSteps(startTime, endTime) {
    const buckets = await this.getAggregatedData(startTime, endTime, 'com.google.step_count.delta');
    let totalSteps = 0;
    buckets.forEach(bucket => {
      bucket.dataset.forEach(dataset => {
        dataset.point.forEach(point => {
          totalSteps += point.value[0].intVal;
        });
      });
    });
    return totalSteps;
  }

  async getCalories(startTime, endTime) {
    const buckets = await this.getAggregatedData(startTime, endTime, 'com.google.calories.expended');
    let totalCalories = 0;
    buckets.forEach(bucket => {
      bucket.dataset.forEach(dataset => {
        dataset.point.forEach(point => {
          totalCalories += point.value[0].fpVal;
        });
      });
    });
    return Math.round(totalCalories);
  }

  async getHeartRate(startTime, endTime) {
    // Attempt heart rate aggregate, return 0 if no source found
    const buckets = await this.getAggregatedData(startTime, endTime, 'com.google.heart_rate.summary');
    let avgHeartRate = 0;
    let count = 0;
    buckets.forEach(bucket => {
      bucket.dataset.forEach(dataset => {
        dataset.point.forEach(point => {
          if (point.value[0].fpVal) {
            avgHeartRate += point.value[0].fpVal; 
            count++;
          }
        });
      });
    });
    return count > 0 ? Math.round(avgHeartRate / count) : 0;
  }

  async getSleep(startTime, endTime) {
    const buckets = await this.getAggregatedData(startTime, endTime, 'com.google.sleep.segment');
    let totalSleepMillis = 0;
    buckets.forEach(bucket => {
      bucket.dataset.forEach(dataset => {
        dataset.point.forEach(point => {
          totalSleepMillis += (point.endTimeNanos - point.startTimeNanos) / 1000000;
        });
      });
    });
    return (totalSleepMillis / (1000 * 60 * 60)).toFixed(1); // Hours
  }

  /**
   * Uses Raw Dataset API instead of Aggregate to avoid "Duration Too Large" errors
   */
  async getLatestWeight() {
    try {
      const endTimeNanos = (Date.now() * 1000000).toString();
      const startTimeNanos = ((Date.now() - 30 * 24 * 60 * 60 * 1000) * 1000000).toString(); // Last 30 days
      
      const res = await this.fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight',
        datasetId: `${startTimeNanos}-${endTimeNanos}`
      });

      const points = res.data.point || [];
      if (points.length === 0) return "—";
      
      const latest = points[points.length - 1];
      return latest.value[0].fpVal.toFixed(1);
    } catch (error) {
      return "—";
    }
  }

  async getLatestHeight() {
    try {
      const endTimeNanos = (Date.now() * 1000000).toString();
      const startTimeNanos = ((Date.now() - 365 * 24 * 60 * 60 * 1000) * 1000000).toString(); // Last year
      
      const res = await this.fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: 'derived:com.google.height:com.google.android.gms:merge_height',
        datasetId: `${startTimeNanos}-${endTimeNanos}`
      });

      const points = res.data.point || [];
      if (points.length === 0) return "—";
      
      const latest = points[points.length - 1];
      return (latest.value[0].fpVal * 100).toFixed(0);
    } catch (error) {
      return "—";
    }
  }

  async getUserProfile() {
    try {
      const people = google.people({ version: 'v1', auth: this.oauth2Client });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      
      let name = "User";
      let photo = "";
      let age = null;
      let gender = "Agnostic";
      let googleId = "";

      // 1. Fetch Basic Identity via OAuth2 (Always enabled)
      try {
        const userRes = await oauth2.userinfo.get();
        if (userRes.data) {
          name = userRes.data.name || name;
          photo = userRes.data.picture || photo;
          googleId = userRes.data.id || userRes.data.sub || "";
        }
      } catch (e) {
        console.log("OAuth Info error:", e.message);
      }

      // 2. Fetch Extended Bio via People API (Requires manual enablement)
      try {
        const peopleRes = await people.people.get({
          resourceName: 'people/me',
          personFields: 'names,photos,birthdays,genders'
        });

        if (peopleRes.data) {
          gender = peopleRes.data.genders?.[0]?.value || gender;
          const birthday = peopleRes.data.birthdays?.[0]?.date;
          if (birthday && birthday.year) {
            const birthDate = new Date(birthday.year, (birthday.month || 1) - 1, birthday.day || 1);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
          }
        }
      } catch (e) {
        // Silently fail People API if disabled
      }
      
      return { googleId, name, photo, age, gender };
    } catch (error) {
      return { googleId: "", name: "VitalMe User", age: null, photo: "", gender: "Agnostic" };
    }
  }
}

module.exports = GoogleFitService;
