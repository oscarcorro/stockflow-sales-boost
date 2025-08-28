import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import ProductItem from './ProductItem';
import ImprovedProductsFilters from './ImprovedProductsFilters';
import ProductsPagination from './ProductsPagination';
import EmptyProductsState from './EmptyProductsState';
import { useProductFilters } from '../hooks/useProductFilters';
import { categories } from '../constants/categories';

interface PendingProduct {
  id: string;
  name: string;
  size: string;
  location: string;
  imageUrl: string;
  priority: 'normal' | 'urgent';
  category?: string;
  subcategory?: string;
  color?: string;
  ubicacion_almacen?: string;
  price?: number | null;
  quantityNeeded: number;     // 👈 NUEVO
}

interface PendingProductsListProps {
  products: PendingProduct[];
  onMarkAsRestocked: (productId: string) => void;
  onProductClick?: (product: PendingProduct) => void;
}

const PendingProductsList: React.FC<PendingProductsListProps> = ({
  products,
  onMarkAsRestocked,
  onProductClick
}) => {
  const navigate = useNavigate();
  const {
    selectedCategory,
    selectedSubcategory,
    filteredProducts,
    handleCategorySelect,
    handleSubcategorySelect,
    hasFilters
  } = useProductFilters(products);

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginated = filteredProducts.slice(startIndex, endIndex);
    const pages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    return { paginatedProducts: paginated, totalPages: pages };
  }, [filteredProducts, currentPage]);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleItemClickDefault = (p: PendingProduct) => {
    navigate(`/product/${p.id}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Card className="flex-1 bg-white border-0 shadow-lg flex flex-col min-h-0">
        <CardContent className="p-6 h-full flex flex-col min-h-0">
          <div className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 flex-shrink-0">
                  Productos por reponer
                </h1>
                <span className="text-sm text-gray-600 truncate">
                  {filteredProducts.length} de {products.length}
                  {selectedCategory && ` en ${selectedCategoryData?.name}`}
                  {selectedSubcategory && ` > ${selectedSubcategory}`}
                </span>
              </div>
              <Button
                onClick={handleSearchClick}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-semibold flex-shrink-0 ml-4"
              >
                <Search className="h-4 w-4" />
                Buscar producto
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 mb-6">
            <ImprovedProductsFilters
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {filteredProducts.length === 0 ? (
              <EmptyProductsState hasFilters={hasFilters} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2 pb-4">
                    {paginatedProducts.map((product) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        onMarkAsRestocked={onMarkAsRestocked}
                        onProductClick={onProductClick ?? handleItemClickDefault}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                  <ProductsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingProductsList;
