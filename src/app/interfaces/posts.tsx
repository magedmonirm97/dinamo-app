export interface Post {
    id: number;
    title: string;
    body: string;
    userId?: number;
    deleted?: boolean;
    isNew?: boolean;
  }
  
  export interface PostResponse {
    posts: Post[];
    total: number;
  }

  export interface PostsTableProps {
    initialPosts: Post[];
    initialTotal: number;
  }

  export interface PostFormProps {
    initialValues?: Post;
    onSubmit: (values: Post) => void;
    loading?: boolean;
    submitText?: string;
  }