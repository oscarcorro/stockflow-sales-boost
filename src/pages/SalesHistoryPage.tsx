import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, TrendingUp, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompactFilterBar from '@/components/CompactFilterBar';
import TooltipBadge from '@/components/TooltipBadge';

const SalesHistoryPage = () => {
  const navigate = useNavigate();

  // Filtros state
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });
  const [productFilter, setProductFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Extended mock sales data - ordenado de más reciente a más antigua
  const salesData = [
    {
      id: '1',
      productName: 'Zapatillas Nike Air Max',
      sku: 'NIK-AM-001',
      category: 'Calzado',
      size: '42',
      color: 'Negro',
      quantity: 2,
      date: '2024-01-15',
      time: '14:30',
      total: 159.98
    },
    {
      id: '2',
      productName: 'Camiseta Adidas Dri-Fit',
      sku: 'ADI-DF-002',
      category: 'Ropa',
      size: 'M',
      color: 'Azul',
      quantity: 1,
      date: '2024-01-15',
      time: '12:15',
      total: 29.99
    },
    {
      id: '3',
      productName: 'Pantalón Deportivo Puma',
      sku: 'PUM-PD-003',
      category: 'Ropa',
      size: 'L',
      color: 'Gris',
      quantity: 1,
      date: '2024-01-14',
      time: '16:45',
      total: 45.00
    },
    {
      id: '4',
      productName: 'Gorra Nike Classic',
      sku: 'NIK-GC-004',
      category: 'Accesorios',
      size: 'Única',
      color: 'Blanco',
      quantity: 3,
      date: '2024-01-14',
      time: '11:20',
      total: 89.97
    },
    {
      id: '5',
      productName: 'Mochila Under Armour',
      sku: 'UA-MOC-005',
      category: 'Accesorios',
      size: '25L',
      color: 'Negro',
      quantity: 1,
      date: '2024-01-13',
      time: '09:30',
      total: 79.99
    },
    {
      id: '6',
      productName: 'Sudadera Nike Tech Fleece',
      sku: 'NIK-TF-006',
      category: 'Ropa',
      size: 'XL',
      color: 'Gris Oscuro',
      quantity: 1,
      date: '2024-01-13',
      time: '15:45',
      total: 89.99
    },
    {
      id: '7',
      productName: 'Zapatillas Adidas Ultraboost',
      sku: 'ADI-UB-007',
      category: 'Calzado',
      size: '40',
      color: 'Blanco',
      quantity: 1,
      date: '2024-01-12',
      time: '13:20',
      total: 179.99
    },
    {
      id: '8',
      productName: 'Shorts Puma Training',
      sku: 'PUM-ST-008',
      category: 'Ropa',
      size: 'M',
      color: 'Negro',
      quantity: 2,
      date: '2024-01-12',
      time: '10:15',
      total: 59.98
    },
    {
      id: '9',
      productName: 'Calcetines Nike Elite',
      sku: 'NIK-CE-009',
      category: 'Accesorios',
      size: '42-46',
      color: 'Blanco',
      quantity: 3,
      date: '2024-01-11',
      time: '17:30',
      total: 44.97
    },
    {
      id: '10',
      productName: 'Chaqueta Adidas Wind',
      sku: 'ADI-CW-010',
      category: 'Ropa',
      size: 'L',
      color: 'Azul Marino',
      quantity: 1,
      date: '2024-01-11',
      time: '14:10',
      total: 69.99
    },
    {
      id: '11',
      productName: 'Zapatillas Puma RS-X',
      sku: 'PUM-RSX-011',
      category: 'Calzado',
      size: '43',
      color: 'Multicolor',
      quantity: 1,
      date: '2024-01-10',
      time: '16:00',
      total: 119.99
    },
    {
      id: '12',
      productName: 'Polo Nike Dri-Fit',
      sku: 'NIK-PD-012',
      category: 'Ropa',
      size: 'S',
      color: 'Verde',
      quantity: 2,
      date: '2024-01-10',
      time: '11:45',
      total: 79.98
    },
    {
      id: '13',
      productName: 'Guantes Under Armour',
      sku: 'UA-GUA-013',
      category: 'Accesorios',
      size: 'L',
      color: 'Negro',
      quantity: 1,
      date: '2024-01-09',
      time: '15:20',
      total: 24.99
    },
    {
      id: '14',
      productName: 'Leggings Nike Pro',
      sku: 'NIK-LP-014',
      category: 'Ropa',
      size: 'M',
      color: 'Negro',
      quantity: 1,
      date: '2024-01-09',
      time: '12:30',
      total: 54.99
    },
    {
      id: '15',
      productName: 'Zapatillas Adidas Stan Smith',
      sku: 'ADI-SS-015',
      category: 'Calzado',
      size: '39',
      color: 'Blanco/Verde',
      quantity: 1,
      date: '2024-01-08',
      time: '14:15',
      total: 89.99
    },
    {
      id: '16',
      productName: 'Camiseta Puma Essentials',
      sku: 'PUM-CE-016',
      category: 'Ropa',
      size: 'XL',
      color: 'Rojo',
      quantity: 1,
      date: '2024-01-08',
      time: '10:40',
      total: 19.99
    },
    {
      id: '17',
      productName: 'Gorra Adidas Trefoil',
      sku: 'ADI-GT-017',
      category: 'Accesorios',
      size: 'Única',
      color: 'Negro',
      quantity: 2,
      date: '2024-01-07',
      time: '13:50',
      total: 49.98
    },
    {
      id: '18',
      productName: 'Pantalón Nike Tech',
      sku: 'NIK-PT-018',
      category: 'Ropa',
      size: 'L',
      color: 'Gris',
      quantity: 1,
      date: '2024-01-07',
      time: '16:25',
      total: 74.99
    },
    {
      id: '19',
      productName: 'Zapatillas Puma Suede',
      sku: 'PUM-SU-019',
      category: 'Calzado',
      size: '44',
      color: 'Azul',
      quantity: 1,
      date: '2024-01-06',
      time: '11:10',
      total: 79.99
    },
    {
      id: '20',
      productName: 'Sudadera Adidas 3-Stripes',
      sku: 'ADI-3S-020',
      category: 'Ropa',
      size: 'M',
      color: 'Negro',
      quantity: 1,
      date: '2024-01-06',
      time: '15:35',
      total: 64.99
    },
    {
      id: '21',
      productName: 'Zapatillas Reebok Classic',
      sku: 'REE-CL-021',
      category: 'Calzado',
      size: '41',
      color: 'Blanco',
      quantity: 1,
      date: '2024-01-05',
      time: '10:30',
      total: 89.99
    },
    {
      id: '22',
      productName: 'Camiseta Nike Dri-Fit',
      sku: 'NIK-DF-022',
      category: 'Ropa',
      size: 'L',
      color: 'Amarillo',
      quantity: 1,
      date: '2024-01-05',
      time: '14:20',
      total: 34.99
    },
    {
      id: '23',
      productName: 'Pantalón Adidas Tiro',
      sku: 'ADI-TI-023',
      category: 'Ropa',
      size: 'M',
      color: 'Negro',
      quantity: 2,
      date: '2024-01-04',
      time: '16:45',
      total: 119.98
    },
    {
      id: '24',
      productName: 'Gorra Puma Essentials',
      sku: 'PUM-ES-024',
      category: 'Accesorios',
      size: 'Única',
      color: 'Verde',
      quantity: 1,
      date: '2024-01-04',
      time: '11:15',
      total: 19.99
    },
    {
      id: '25',
      productName: 'Mochila Nike Heritage',
      sku: 'NIK-HE-025',
      category: 'Accesorios',
      size: '20L',
      color: 'Azul',
      quantity: 1,
      date: '2024-01-03',
      time: '09:30',
      total: 49.99
    },
    {
      id: '26',
      productName: 'Sudadera Puma Essential',
      sku: 'PUM-ES-026',
      category: 'Ropa',
      size: 'XL',
      color: 'Gris',
      quantity: 1,
      date: '2024-01-03',
      time: '15:20',
      total: 54.99
    },
    {
      id: '27',
      productName: 'Zapatillas Adidas Gazelle',
      sku: 'ADI-GA-027',
      category: 'Calzado',
      size: '42',
      color: 'Verde',
      quantity: 1,
      date: '2024-01-02',
      time: '13:45',
      total: 99.99
    },
    {
      id: '28',
      productName: 'Shorts Nike Training',
      sku: 'NIK-TR-028',
      category: 'Ropa',
      size: 'S',
      color: 'Azul',
      quantity: 1,
      date: '2024-01-02',
      time: '10:15',
      total: 39.99
    },
    {
      id: '29',
      productName: 'Calcetines Adidas Crew',
      sku: 'ADI-CR-029',
      category: 'Accesorios',
      size: '40-44',
      color: 'Negro',
      quantity: 3,
      date: '2024-01-01',
      time: '17:30',
      total: 29.97
    },
    {
      id: '30',
      productName: 'Chaqueta Puma Windbreaker',
      sku: 'PUM-WB-030',
      category: 'Ropa',
      size: 'L',
      color: 'Rojo',
      quantity: 1,
      date: '2024-01-01',
      time: '14:00',
      total: 79.99
    },
    {
      id: '31',
      productName: 'Zapatillas New Balance 990',
      sku: 'NB-990-031',
      category: 'Calzado',
      size: '43',
      color: 'Gris',
      quantity: 1,
      date: '2023-12-31',
      time: '16:20',
      total: 189.99
    },
    {
      id: '32',
      productName: 'Polo Lacoste Classic',
      sku: 'LAC-CL-032',
      category: 'Ropa',
      size: 'M',
      color: 'Blanco',
      quantity: 1,
      date: '2023-12-31',
      time: '11:30',
      total: 89.99
    },
    {
      id: '33',
      productName: 'Guantes Nike Running',
      sku: 'NIK-RU-033',
      category: 'Accesorios',
      size: 'M',
      color: 'Negro',
      quantity: 1,
      date: '2023-12-30',
      time: '15:45',
      total: 19.99
    },
    {
      id: '34',
      productName: 'Leggings Adidas Tights',
      sku: 'ADI-TI-034',
      category: 'Ropa',
      size: 'S',
      color: 'Negro',
      quantity: 1,
      date: '2023-12-30',
      time: '12:10',
      total: 44.99
    },
    {
      id: '35',
      productName: 'Zapatillas Converse Chuck Taylor',
      sku: 'CON-CT-035',
      category: 'Calzado',
      size: '40',
      color: 'Blanco',
      quantity: 1,
      date: '2023-12-29',
      time: '14:30',
      total: 69.99
    },
    {
      id: '36',
      productName: 'Camiseta Under Armour Tech',
      sku: 'UA-TE-036',
      category: 'Ropa',
      size: 'XL',
      color: 'Azul',
      quantity: 1,
      date: '2023-12-29',
      time: '10:15',
      total: 29.99
    },
    {
      id: '37',
      productName: 'Gorra New Era 9FIFTY',
      sku: 'NE-950-037',
      category: 'Accesorios',
      size: 'Única',
      color: 'Negro',
      quantity: 1,
      date: '2023-12-28',
      time: '13:50',
      total: 34.99
    },
    {
      id: '38',
      productName: 'Pantalón Levi\'s 511',
      sku: 'LEV-511-038',
      category: 'Ropa',
      size: '32',
      color: 'Azul',
      quantity: 1,
      date: '2023-12-28',
      time: '16:25',
      total: 79.99
    },
    {
      id: '39',
      productName: 'Zapatillas Vans Old Skool',
      sku: 'VAN-OS-039',
      category: 'Calzado',
      size: '41',
      color: 'Negro',
      quantity: 1,
      date: '2023-12-27',
      time: '11:10',
      total: 59.99
    },
    {
      id: '40',
      productName: 'Sudadera Champion Hoodie',
      sku: 'CHA-HO-040',
      category: 'Ropa',
      size: 'L',
      color: 'Gris',
      quantity: 1,
      date: '2023-12-27',
      time: '15:35',
      total: 49.99
    }
  ];

  const availableColors = [...new Set(salesData.map(sale => sale.color))];
  const availableSizes = [...new Set(salesData.map(sale => sale.size))];

  const filteredSales = useMemo(() => {
    let filtered = [...salesData];

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date + 'T' + sale.time);
        
        if (dateRange.from && dateRange.to) {
          return saleDate >= dateRange.from && saleDate <= dateRange.to;
        } else if (dateRange.from) {
          return saleDate >= dateRange.from;
        } else if (dateRange.to) {
          return saleDate <= dateRange.to;
        }
        
        return true;
      });
    }

    if (timeRange.from || timeRange.to) {
      filtered = filtered.filter(sale => {
        const saleTime = sale.time;
        
        if (timeRange.from && timeRange.to) {
          return saleTime >= timeRange.from && saleTime <= timeRange.to;
        } else if (timeRange.from) {
          return saleTime >= timeRange.from;
        } else if (timeRange.to) {
          return saleTime <= timeRange.to;
        }
        
        return true;
      });
    }

    if (productFilter) {
      filtered = filtered.filter(sale => 
        sale.productName.toLowerCase().includes(productFilter.toLowerCase())
      );
    }

    if (skuFilter) {
      filtered = filtered.filter(sale => 
        sale.sku.toLowerCase().includes(skuFilter.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(sale => 
        sale.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(sale => selectedColors.includes(sale.color));
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(sale => selectedSizes.includes(sale.size));
    }

    return filtered.sort((a, b) => {
      const dateTimeA = new Date(a.date + 'T' + a.time);
      const dateTimeB = new Date(b.date + 'T' + b.time);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  }, [salesData, dateRange, timeRange, productFilter, skuFilter, categoryFilter, selectedColors, selectedSizes]);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with improved typography */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 h-9 px-3 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Historial de Ventas</h1>
            <p className="text-sm text-gray-600 mt-0.5">Registro de todas las ventas realizadas</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="w-full px-4 py-3 flex-1 flex flex-col gap-4 min-h-0">
          {/* KPIs with improved typography and spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Ventas Totales</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">€{totalSales.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">{filteredSales.length} ventas</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Productos Vendidos</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{totalItems}</div>
                    <p className="text-sm text-muted-foreground">Unidades totales</p>
                  </div>
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Transacciones</p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{filteredSales.length}</div>
                    <p className="text-sm text-muted-foreground">Ventas realizadas</p>
                  </div>
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compact filters */}
          <div className="flex-shrink-0">
            <CompactFilterBar
              dateRange={dateRange}
              onDateRangeChange={(from, to) => setDateRange({ from, to })}
              timeRange={timeRange}
              onTimeRangeChange={(from, to) => setTimeRange({ from, to })}
              productFilter={productFilter}
              onProductFilterChange={setProductFilter}
              skuFilter={skuFilter}
              onSkuFilterChange={setSkuFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              selectedColors={selectedColors}
              onColorChange={setSelectedColors}
              availableColors={availableColors}
              selectedSizes={selectedSizes}
              onSizeChange={setSelectedSizes}
              availableSizes={availableSizes}
              selectedQuickFilter={selectedQuickFilter}
              onQuickFilterChange={setSelectedQuickFilter}
            />
          </div>

          {/* Sales history with improved styling */}
          <Card className="flex-1 flex flex-col min-h-0 shadow-sm">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Historial Detallado</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full w-full">
                <div className="p-4 space-y-3">
                  {filteredSales.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron ventas con los filtros aplicados.
                    </div>
                  ) : (
                    filteredSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-base truncate">{sale.productName}</h3>
                            <Badge variant="outline" className="text-xs font-medium">{sale.sku}</Badge>
                            <Badge variant="secondary" className="text-xs font-medium">{sale.size}</Badge>
                            <Badge variant="outline" className="text-xs font-medium">{sale.color}</Badge>
                            <Badge variant="outline" className="text-xs font-medium">{sale.category}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium">Cant: {sale.quantity}</span>
                            <span>•</span>
                            <span>{sale.date}</span>
                            <span>•</span>
                            <span>{sale.time}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="font-bold text-lg text-gray-900 mb-1">
                            €{sale.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            €{(sale.total / sale.quantity).toFixed(2)} c/u
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryPage;
