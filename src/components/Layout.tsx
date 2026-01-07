import React from 'react';
import AppLayout from './layout/AppLayout';

// Re-export AppLayout as Layout for backward compatibility
// This ensures existing imports of { Layout } from '../components/Layout' still work
export const Layout = AppLayout;
export default AppLayout;
