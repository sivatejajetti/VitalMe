import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Scale, Ruler, Calendar, UserRound, Save, BadgeCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/services/api";
import { toast } from "sonner";

const Profile = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getUserProfile,
  });

  const [formData, setFormData] = useState({
    display_name: "",
    height: "",
    weight: "",
    age: "",
    gender: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.name || "",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || ""
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      display_name: formData.display_name,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      age: parseInt(formData.age),
      gender: formData.gender
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Personal Profile</h1>
        <p className="text-muted-foreground">Manage your biological metrics for smarter health analysis.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1 flex flex-col items-center p-6 glass-card text-center space-y-4"
        >
          <div className="relative">
            <img 
              src={profile?.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200"} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full ring-4 ring-background">
              <BadgeCheck className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{profile?.name}</h2>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <div className="pt-4 border-t border-border w-full">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary/60">Account Level</span>
            <p className="text-sm font-semibold text-foreground">Standard Intelligence</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 glass-card-glow p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <User className="w-3 h-3" /> Display Name
                </label>
                <input 
                  type="text" 
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <UserRound className="w-3 h-3" /> Gender
                </label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <Scale className="w-3 h-3" /> Weight (kg)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <Ruler className="w-3 h-3" /> Height (cm)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Age
                </label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? "Synchronizing..." : <><Save className="w-4 h-4" /> Save Profile Metrics</>}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5 }}
        className="glass-card p-6 border-l-4 border-primary"
      >
        <h3 className="text-sm font-bold text-foreground mb-2">Cloud Intelligence Note</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          These body metrics are stored securely in your private cloud. They override basic data from Google Fit to provide 
          more accurate calorie burn calculations and personalized health scores.
        </p>
      </motion.div>
    </div>
  );
};

export default Profile;
