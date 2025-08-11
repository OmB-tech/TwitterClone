import { useState } from 'react';
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './CommentSection.css';

const CommentSection = ({ postId, comments = [], loggedinuser, onCommentPosted }) => {
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setIsLoading(true);
        const commentPayload = {
            username: loggedinuser[0]?.username,
            name: loggedinuser[0]?.name,
            profileImage: loggedinuser[0]?.profileImage || "https://i.ibb.co/HsC1vhf/e.png",
            text: newComment,
        };
        try {
            const res = await fetch(`https://twitterclone-1-uvwk.onrender.com/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: commentPayload }),
            });
            if (!res.ok) throw new Error("Failed to post comment.");
            toast.success("Comment posted!");
            setNewComment("");
            onCommentPosted();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="comment-section">
            <div className="comment-input-area">
                <Avatar src={loggedinuser[0]?.profileImage} />
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Post your reply" className="comment-input" />
                <button onClick={handlePostComment} disabled={isLoading} className="comment-post-btn">{isLoading ? "..." : "Reply"}</button>
            </div>
            <div className="comment-list">
                {comments.length > 0 ? (
                    comments.slice(0).reverse().map((comment, index) => (
                        <div key={index} className="comment-item">
                            <Avatar src={comment.profileImage} />
                            <div className="comment-content">
                                <p>
                                    <Link to={`/home/profile/${comment.username}`} className="profile-link"><strong>{comment.name}</strong></Link>
                                    <span className="post__headerSpecial"> @{comment.username}</span>
                                </p>
                                <p>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : ( <p style={{textAlign: 'center', color: 'grey', padding: '20px'}}>No replies yet.</p> )}
            </div>
        </div>
    );
};

export default CommentSection;