import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MedicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { medications, fetchMedications } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredMedications, setFilteredMedications] = useState([]);

  const navigate = useNavigate();
  const categories = Array.from(new Set(medications.map(m => m.category)));

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    filterMedications();
  }, [medications, searchQuery, activeCategory]);

  const filterMedications = () => {
    let filtered = medications;
    if (searchQuery.trim()) {
      filtered = filtered.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeCategory) {
      filtered = filtered.filter(m => m.category === activeCategory);
    }
    setFilteredMedications(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      filterMedications();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('medications.title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('medications.subtitle')}</p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <Input
          type="text"
          placeholder={t('medications.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          icon={<Search className="h-5 w-5" />}
          className="w-full"
        />
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className={`cursor-pointer px-3 py-1 text-sm rounded-full border ${activeCategory === category ? 'border-cyan-600 bg-cyan-100' : 'border-gray-300'}`}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
            >
              {category}
            </button>
          ))}
          {activeCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="text-xs"
            >
              {t('medications.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      <div>
        {filteredMedications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('medications.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hoverable>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{medication.name}</CardTitle>
                      <Badge variant={medication.prescription ? 'warning' : 'success'}>
                        {medication.prescription
                          ? t('medications.prescription')
                          : t('medications.otc')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700">{medication.description}</p>
                    <Badge variant="secondary">{medication.category}</Badge>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t('medications.availableAt')}
                      </h4>
                      <ul className="space-y-2">
                        {medication.pharmacies.map((pharmacy) => (
                          <li key={pharmacy.id} className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">{pharmacy.name}</span>
                            <div className="flex items-center">
                              {pharmacy.inStock ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-sm text-green-600">{t('medications.inStock')}</span>
                                  {pharmacy.price && (
                                    <span className="ml-2 text-sm font-medium">
                                      ${pharmacy.price.toFixed(2)}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                  <span className="text-sm text-red-600">{t('medications.outOfStock')}</span>
                                </>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => navigate(`/medications/${medication.id}`)} fullWidth>
                      {t('medications.viewDetails')}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationsPage;
