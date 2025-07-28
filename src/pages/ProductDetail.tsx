
import ProductDetail from '@/components/ProductDetail';
import { useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = () => {
    // This could navigate to the next product in the list
    console.log('Navigate to next product');
  };

  const handleMarkAsRestocked = () => {
    console.log('Product marked as restocked');
    // Here you could make an API call to update the product status
  };

  return (
    <ProductDetail 
      onBack={handleBack}
      onNext={handleNext}
      onMarkAsRestocked={handleMarkAsRestocked}
    />
  );
};

export default ProductDetailPage;
