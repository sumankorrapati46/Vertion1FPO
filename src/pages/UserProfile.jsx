import React, { useEffect, useState } from "react";
import { getUserProfile } from "../api/apiService";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setProfile(res.data);
      } catch (error) {
        console.error("Profile fetch failed:", error);
        alert("Please login again.");
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile.firstName} {profile.lastName}</h1>
      <p>Email: {profile.email}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default UserProfile;
