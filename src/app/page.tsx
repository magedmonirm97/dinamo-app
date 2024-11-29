import React from 'react';
import { Row, Col } from 'antd';
import PostsTable from './components/Post/PostsTable';
import { postService } from './services/postServices';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  try {
    // Server-side fetch of posts on each request 
    const { posts, total } = await postService.fetchPosts();

    return (
      <div style={{ padding: '24px' }}>
        <Row>
          <Col span={24}>
            <PostsTable 
              initialPosts={posts} 
              initialTotal={total} 
            />
          </Col>
        </Row>
      </div>
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return (
      <div>
        <p>Error loading posts. Please try again later.</p>
      </div>
    );
  }
}