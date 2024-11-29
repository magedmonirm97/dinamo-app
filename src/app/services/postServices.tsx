import axios from 'axios';
import { Post, PostResponse } from '../interfaces/posts';

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

export const postService = {
  async fetchPosts(): Promise<PostResponse> {
    try {
      const response = await axios.get<Post[]>(BASE_URL, {
      });

      return {
        posts: response.data,
        total: response.data.length,
      };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  },

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    const response = await axios.post<Post>(BASE_URL, post);
    return response.data;
  },

  // Not used in this app, but included for completeness
  async getPostById(id: number): Promise<Post> {
    const response = await axios.get<Post>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async updatePost(id: number, post: Partial<Post>): Promise<Post> {
    const response = await axios.put<Post>(`${BASE_URL}/${id}`, post);
    return response.data;
  },

  async deletePost(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  }
};