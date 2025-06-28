import React, { useEffect, useState } from "react";
import "./Feed.css";
import Posts from "./Posts/Posts";
import Tweetbox from "./Tweetbox/Tweetbox";
import useLoggedinuser from "../../hooks/useLoggedinuser";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loggedinuser] = useLoggedinuser();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/post");
        const data = await res.json();
        
        // Enhance posts with username
        const enhancedPosts = await Promise.all(data.map(async post => {
          const userRes = await fetch(`http://localhost:5000/users?email=${post.email}`);
          const userData = await userRes.json();
          return {
            ...post,
            username: userData[0]?.username || post.email.split('@')[0]
          };
        }));
        
        setPosts(enhancedPosts);
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    };

    fetchPosts();
  }, [posts]);

  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>
      <Tweetbox />
      {posts.map((p) => (
        <Posts key={p._id} p={p} />
      ))}
    </div>
  );
};

export default Feed;
