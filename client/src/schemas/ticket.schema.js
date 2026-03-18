import { z } from 'zod';

export const createTicketSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  product_id: z
    .number({ invalid_type_error: 'Please select a product' })
    .int()
    .positive('Please select a product'),
});

export const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty').trim(),
});
