import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import PharmacyMapView from './PharmacyMapView';
import useStore from '../store';
import { Pharmacy } from '../types';

const PharmaciesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    pharmacies: allPharmacies,
    setPharmacies,
    fetchPharmacies,
    fetchPharmaciesByCity,
  } = useStore();

  const [searchCity, setSearchCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [showCityOptions, setShowCityOptions] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Calculate distance between two lat/lng points in km
  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  useEffect(() => {
    if (allPharmacies.length) {
      const uniqueCities = Array.from(new Set(allPharmacies.map((p) => p.city)));
      setCityOptions(uniqueCities);
    }
  }, [allPharmacies]);

  const filteredPharmacies = searchCity.trim()
    ? allPharmacies.filter((p) =>
        p.city.toLowerCase().includes(searchCity.trim().toLowerCase())
      )
    : allPharmacies;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchCity(val);
    setShowCityOptions(val.trim().length > 0);
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    setShowCityOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setShowCityOptions(false);
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert(t('errors.geolocationNotSupported'));
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const nearbyPharmacies = allPharmacies.filter(
          (p) =>
            p.coordinates &&
            getDistance(latitude, longitude, p.coordinates.lat, p.coordinates.lng) <= 10
        );
        setPharmacies(nearbyPharmacies);
        setSearchCity(t('search.useMyLocation'));
        setIsLocating(false);
      },
      () => {
        alert(t('errors.geolocationNotSupported'));
        setIsLocating(false);
      }
    );
  };

  const handleCloseMapModal = () => setShowMapModal(false);

  const handleViewMap = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowMapModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('pharmacies.title')}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('pharmacies.subtitle')}</p>
      </header>

      <section className="max-w-xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder={t('pharmacies.placeholder')}
              value={searchCity}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              icon={<MapPin className="h-5 w-5" />}
              className="w-full"
              aria-label={t('pharmacies.placeholder')}
              autoComplete="off"
            />
            {showCityOptions && cityOptions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto py-1 text-base">
                {cityOptions
                  .filter((city) => city.toLowerCase().includes(searchCity.toLowerCase()))
                  .map((city) => (
                    <li
                      key={city}
                      className="cursor-pointer select-none px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={handleUseMyLocation}
            icon={<MapPin className="h-5 w-5" />}
            className="md:w-auto"
            isLoading={isLocating}
          >
            {t('pharmacies.useMyLocation')}
          </Button>
        </div>
      </section>

      <section>
        {searchCity.trim() ? (
          <h2 className="text-xl font-semibold mb-4">
            {t('pharmacies.pharmaciesIn', { city: searchCity })}
          </h2>
        ) : (
          <h2 className="text-xl font-semibold mb-4">{t('pharmacies.allPharmacies')}</h2>
        )}

        {isSearching ? (
          <p className="text-center text-gray-500">{t('pharmacies.loading')}</p>
        ) : filteredPharmacies.length === 0 ? (
          <p className="text-center text-gray-600">{t('pharmacies.noResults')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacies.map((pharmacy, i) => (
              <motion.div
                key={pharmacy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card hoverable>
                  <CardHeader>
                    <CardTitle>{pharmacy.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{`${pharmacy.address}, ${pharmacy.city}`}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                      <p className="text-gray-700">{pharmacy.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                      <p className="text-gray-700">{pharmacy.email}</p>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{pharmacy.hours}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleViewMap(pharmacy)} size="sm">
                      {t('card.viewOnMap')}
                    </Button>
                    <Button onClick={() => navigate(`/pharmacies/${pharmacy.id}`)} size="sm">
                      {t('card.viewDetails')}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {showMapModal && selectedPharmacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative">
            <h2 className="text-xl font-bold mb-4">
              {selectedPharmacy.name} - {t('card.location')}
            </h2>
            <div style={{ height: 400, width: '100%' }}>
              <PharmacyMapView
                latitude={selectedPharmacy.coordinates.lat}
                longitude={selectedPharmacy.coordinates.lng}
              />
            </div>
            <Button onClick={handleCloseMapModal} className="absolute top-4 right-4">
              {t('mapModal.close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaciesPage;
