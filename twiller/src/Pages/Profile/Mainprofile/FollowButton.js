import { useEffect, useState } from 'react';

const FollowButton = ({ profileUserEmail, loggedInUserEmail }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    if (!loggedInUserEmail) return;
    const checkFollowingStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/loggedinuser?email=${loggedInUserEmail}`);
        const userData = await res.json();
        if (userData && userData.following) {
          setIsFollowing(userData.following.includes(profileUserEmail));
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkFollowingStatus();
  }, [profileUserEmail, loggedInUserEmail]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/follow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          followerEmail: loggedInUserEmail, 
          followeeEmail: profileUserEmail 
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsFollowing(data.isFollowing);
      } else {
        console.error('Server error:', data.error);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <button disabled>Loading...</button>;

  return (
    <button 
      onClick={handleFollowToggle}
      className={isFollowing ? 'unfollow-btn' : 'follow-btn'}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
