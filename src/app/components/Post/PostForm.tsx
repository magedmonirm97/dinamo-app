import React from 'react';
import { Form, Input, Button } from 'antd';
import { PostFormProps } from '../../interfaces/posts';

const PostForm: React.FC<PostFormProps> = ({ 
  initialValues, 
  onSubmit, 
  loading,
  submitText = 'Submit' 
}) => {
  const [form] = Form.useForm();
   form.setFieldsValue(initialValues);
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please input the title!' }]}
      >
        <Input placeholder="Enter post title" />
      </Form.Item>

      <Form.Item
        name="body"
        label="Body"
        rules={[{ required: true, message: 'Please input the post content!' }]}
      >
        <Input.TextArea 
          placeholder="Enter post content" 
          rows={4} 
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PostForm;