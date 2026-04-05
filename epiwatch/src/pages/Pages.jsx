import React from 'react';
import { motion } from 'framer-motion';

import DashboardOriginal from './Dashboard';
import CountryAnalysisOriginal from './CountryAnalysis';
import RiskMapOriginal from './RiskMap';
import HotspotDetectionOriginal from './HotspotDetection';
import AIInsightsOriginal from './AIInsights';
import CompareCountriesOriginal from './CompareCountries';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const Dashboard = (props) => <PageTransition><DashboardOriginal {...props} /></PageTransition>;
export const CountryAnalysis = (props) => <PageTransition><CountryAnalysisOriginal {...props} /></PageTransition>;
export const RiskMap = (props) => <PageTransition><RiskMapOriginal {...props} /></PageTransition>;
export const HotspotDetection = (props) => <PageTransition><HotspotDetectionOriginal {...props} /></PageTransition>;
export const AIInsights = (props) => <PageTransition><AIInsightsOriginal {...props} /></PageTransition>;
export const CompareCountries = (props) => <PageTransition><CompareCountriesOriginal {...props} /></PageTransition>;

