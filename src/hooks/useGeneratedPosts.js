import { useState, useEffect, useCallback } from 'react';
import API_ENDPOINTS from '../config/api';
import { useAuthFetch } from './useAuthFetch';

export function useGeneratedPosts(page = 1, limit = 10) {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuthFetch();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_ENDPOINTS.generatedPosts}?page=${page}&limit=${limit}`;
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch generated posts: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setTotalCount(data.total_count);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching generated posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, fetchWithAuth]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refetch = () => {
    fetchPosts();
  };

  const addNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setTotalCount(prev => prev + 1);
  };

  const updatePost = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  return {
    posts,
    totalCount,
    totalPages,
    loading,
    error,
    refetch,
    addNewPost,
    updatePost
  };
}