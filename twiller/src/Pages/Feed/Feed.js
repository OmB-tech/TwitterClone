import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Feed.css";
import Posts from "./Posts/Posts";
import Tweetbox from "./Tweetbox/Tweetbox";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const postRefs = useRef({});

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("https://twitterclone-1-uvwk.onrender.com/post");
      const data = await res.json();
      const enhancedPosts = await Promise.all(data.map(async post => {
        const userRes = await fetch(`https://twitterclone-1-uvwk.onrender.com/users?email=${post.email}`);
        const userData = await userRes.json();
        return { ...post, username: userData[0]?.username || post.email.split('@')[0] };
      }));
      setPosts(enhancedPosts);
    } catch (err) { console.error("Failed to load posts", err); }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  //scroll to the next video
  const handlePlayNextVideo = (currentPostId) => {
    const currentIndex = posts.findIndex(p => p._id === currentPostId);
    if (currentIndex === -1) return; 
    for (let i = currentIndex + 1; i < posts.length; i++) {
        const post = posts[i];
        const isVideo = post.photo && (post.photo.includes('.mp4') || post.photo.includes('.webm') || post.photo.includes('.ogg'));
        
        if (isVideo) {
            const nextPostRef = postRefs.current[post._id];
            if (nextPostRef) {
                nextPostRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
    }
  };

  return (
    <div className="feed">
      <div className="feed__header"><h2>Home</h2></div>
      <Tweetbox onPost={fetchPosts} />
      {posts.map((p) => (
        // Assign a ref to each post's container div
        <div key={p._id} ref={el => postRefs.current[p._id] = el}>
            <Posts 
                p={p} 
                onPostUpdate={fetchPosts}
                onPlayNext={() => handlePlayNextVideo(p._id)}
            />
        </div>
      ))}
    </div>
  );
};

export default Feed;
