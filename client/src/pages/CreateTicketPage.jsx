import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Package, CheckCircle } from 'lucide-react';
import { createTicketSchema } from '../schemas/ticket.schema.js';
import { useCreateTicket } from '../hooks/useTickets.js';
import ProductSelectorModal from '../components/ProductSelectorModal.jsx';
import { getProductImage } from '../lib/productImage.js';

const InputField = ({ label, error, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error.message}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 ${
    hasError ? 'border-red-300 bg-red-50/40' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
  }`;

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { mutateAsync: createTicket, isPending } = useCreateTicket();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createTicketSchema) });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setValue('product_id', product.id, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);
      await createTicket({
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        subject: data.subject,
        message: data.message,
        productId: data.product_id,
        productTitle: selectedProduct?.title || `Product #${data.product_id}`,
        productPrice: Number(selectedProduct?.price ?? 0),
        productImage: getProductImage(selectedProduct?.images),
      });
      setSubmitted(true);
      reset();
      setSelectedProduct(null);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      setSubmitError('Failed to submit ticket. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Ticket Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <PlusCircle size={22} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">New Support Ticket</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in the details below to submit a support request</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-5 max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField label="Full Name" error={errors.customer_name} required>
            <input
              {...register('customer_name')}
              placeholder="Jane Doe"
              className={inputClass(errors.customer_name)}
            />
          </InputField>

          <InputField label="Email Address" error={errors.customer_email} required>
            <input
              {...register('customer_email')}
              type="email"
              placeholder="jane@example.com"
              className={inputClass(errors.customer_email)}
            />
          </InputField>
        </div>

        <InputField label="Subject" error={errors.subject} required>
          <input
            {...register('subject')}
            placeholder="Brief description of your issue"
            className={inputClass(errors.subject)}
          />
        </InputField>

        <InputField label="Product" error={errors.product_id} required>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 border rounded-xl text-sm text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
              errors.product_id ? 'border-red-300 bg-red-50/40' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
            }`}
          >
            <Package size={16} className={selectedProduct ? 'text-indigo-600' : 'text-slate-400'} />
            {selectedProduct ? (
              <>
                <span className="flex-1 truncate text-slate-800 dark:text-slate-100">{selectedProduct.title}</span>
                <span className="text-xs text-indigo-600 font-medium flex-shrink-0">Change</span>
              </>
            ) : (
              <span className="text-slate-400">Click to select a product...</span>
            )}
          </button>
          <input type="hidden" {...register('product_id', { valueAsNumber: true })} />
        </InputField>

        <InputField label="Message" error={errors.message} required>
          <textarea
            {...register('message')}
            rows={5}
            placeholder="Please describe your issue in detail..."
            className={`${inputClass(errors.message)} resize-none`}
          />
        </InputField>

        {submitError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {isPending ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>

      {showModal && (
        <ProductSelectorModal
          selected={selectedProduct}
          onSelect={handleProductSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
