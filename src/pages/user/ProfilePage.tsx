
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-md border-slate-200 dark:border-slate-700 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <motion.div className="space-y-4" variants={containerVariants}>
                  <motion.div variants={itemVariants} className="border-b dark:border-slate-700 pb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="border-b dark:border-slate-700 pb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="border-b dark:border-slate-700 pb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Role</p>
                    <p className="font-medium capitalize">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                          : user?.role === 'seller' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}
                      >
                        {user?.role}
                      </span>
                    </p>
                  </motion.div>
                  
                  {user?.phone && (
                    <motion.div variants={itemVariants} className="border-b dark:border-slate-700 pb-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          {user?.address && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-md border-slate-200 dark:border-slate-700 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <span>Address Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <motion.div className="space-y-4" variants={containerVariants}>
                    {user?.address?.street && (
                      <motion.div variants={itemVariants} className="border-b dark:border-slate-700 pb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Street</p>
                        <p className="font-medium">{user.address.street}</p>
                      </motion.div>
                    )}
                    
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 border-b dark:border-slate-700 pb-4">
                      {user?.address?.city && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">City</p>
                          <p className="font-medium">{user.address.city}</p>
                        </div>
                      )}
                      
                      {user?.address?.state && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">State</p>
                          <p className="font-medium">{user.address.state}</p>
                        </div>
                      )}
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      {user?.address?.postalCode && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Postal Code</p>
                          <p className="font-medium">{user.address.postalCode}</p>
                        </div>
                      )}
                      
                      {user?.address?.country && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Country</p>
                          <p className="font-medium">{user.address.country}</p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
