'use client';

import React, { useState } from 'react';
import { Table, Button, Modal, App } from 'antd';
import { PostsTableProps, Post } from '../../interfaces/posts';
import { postService } from '../../services/postServices';
import PostForm from './PostForm';


const PostsTable: React.FC<PostsTableProps> = ({ initialPosts, initialTotal }) => {
  const { message } = App.useApp();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [localModifications, setLocalModifications] = useState<{[key: number]: Post}>({});
  const [maxApiId] = useState(Math.max(...initialPosts.map(p => p.id)));

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: Partial<Post>) => {
    if (!editingPost) return;
  
    try {
      setLoading(true);
      const updatedPost = { ...editingPost, ...values } as Post;
  
      if (editingPost.id > maxApiId) {
        // For locally added posts, just update in localModifications
        setLocalModifications(prevModifications => ({
          ...prevModifications,
          [editingPost.id]: { ...updatedPost, isNew: true }
        }));
      } else {
        // For API posts, call API and update localModifications
        const updated = await postService.updatePost(editingPost.id, updatedPost);
        setLocalModifications(prevModifications => ({
          ...prevModifications,
          [updated.id]: updated
        }));
      }
  
      setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
      setEditingPost(null);
      message.success('Post updated successfully', 5);
    } catch (error) {
      message.error('Failed to update post');
      console.error('Failed to update post:', error);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };  

  const handleCreate = async (post: Post) => {
    try {
      setLoading(true);
      const newPost = await postService.createPost(post);
      
      // Generate a unique ID for the new post
      const newId = maxApiId + Object.values(localModifications).length + 1;
      
      // Keep all previous new posts while adding the latest one
      const updatedModifications = {
        ...localModifications,
        [newId]: { ...newPost, id: newId, isNew: true } as Post
      };
      setLocalModifications(updatedModifications);
  
      const newTotal = total + 1;
      const lastPage = Math.ceil(newTotal / 10);
      setTotal(newTotal);
      setCurrentPage(lastPage);

      setPosts([...posts, { ...newPost, id: newId }]);
      
      setIsCreateModalVisible(false);
      message.success('Post created successfully', 5);

    } catch (error) {
      message.error('Failed to create post');
      console.error('Failed to create post:', error);
    
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      
      // For mock API posts, just mark as deleted in localModifications
      if (id <= maxApiId) {
        await postService.deletePost(id);
        setLocalModifications((prevModifications) => ({
          ...prevModifications,
          [id]: { ...posts.find(p => p.id === id)!, deleted: true } as Post
        }));
      } else {
        // For locally added posts, remove from localModifications immediately
        setLocalModifications(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    
      setPosts(posts.filter(post => post.id !== id));
      setTotal(prev => prev - 1);
      
      message.success('Post deleted successfully',5);
    } catch (error) {
      message.error('Failed to delete post');
      console.error('Failed to delete post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    try {
      setLoading(true);
      const { posts: newPosts } = await postService.fetchPosts();
      
      const allPosts = [...newPosts]

        .filter(post => !localModifications[post.id]?.deleted)
        .map(post => localModifications[post.id] || post);
  
      const newAddedPosts = Object.values(localModifications)
        .filter(post => post.isNew);
      allPosts.push(...newAddedPosts);
      
      setPosts(allPosts);
      setCurrentPage(page);
    } catch (error) {
      message.error('Failed to fetch posts');
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Body', 
      dataIndex: 'body', 
      key: 'body', 
      render: (text: string) => (
        <div className='tableCell'>{text}</div>
      ) 
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Post) => (
        <div className='actionsContainer'>
          <Button 
            type='primary' 
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            onClick={() => handleDelete(record.id)}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div className='container'>
      <Button 
        type='primary' 
        onClick={() => setIsCreateModalVisible(true)}
        className='createButton'
      >
        Create Post
      </Button>
  
      <Table 
        className='table'
        columns={columns} 
        dataSource={posts} 
        rowKey='id'
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: false,
          current: currentPage,
          onChange: handlePageChange
        }}
      />
  
      <Modal
        title='Edit Post'
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPost(null);
        }}
        footer={null}
        className='modal'
      >
        <div className='modalContent'>
          <PostForm 
            initialValues={editingPost || undefined}
            onSubmit={handleSubmit}
            loading={loading}
            submitText='Update'
          />
        </div>
      </Modal>
  
      <Modal
        title='Create Post'
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        className='modal'
      >
        <div className='modalContent'>
          <PostForm 
            onSubmit={handleCreate}
            loading={loading}
            submitText='Create'
          />
        </div>
      </Modal>
    </div>
  );
};

export default PostsTable;
