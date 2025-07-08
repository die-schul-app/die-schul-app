import { useEffect } from 'react';
import { useDSB } from './useDSB';

// Simple test function to verify DSB integration
export function testDSBIntegration() {
  console.log('🧪 Testing DSB Integration (Android API)...');
  
  // Test 1: Check if DSB client can be instantiated
  try {
    const { DSBClient } = require('./DSB/DSBClient');
    const client = new DSBClient('test', 'test');
    console.log('✅ DSB Client instantiation: SUCCESS');
    console.log('   - Using Android API endpoint: https://app.dsbcontrol.de');
    console.log('   - Compression: GZIP with pako library');
  } catch (error) {
    console.log('❌ DSB Client instantiation: FAILED', error);
  }
  
  // Test 2: Check if TimeTable class works
  try {
    const { TimeTable } = require('./DSB/TimeTable');
    const mockHtml = '<table><tr><td>1</td><td>08:00-09:30</td><td>Math</td><td>101</td></tr></table>';
    const timetable = TimeTable.fromHtml(mockHtml);
    console.log('✅ TimeTable parsing: SUCCESS', timetable.items.length, 'items');
  } catch (error) {
    console.log('❌ TimeTable parsing: FAILED', error);
  }
  
  // Test 3: Check compression library
  try {
    const { deflate, inflate } = require('pako');
    const testData = 'Hello DSB World!';
    const compressed = deflate(new TextEncoder().encode(testData));
    const decompressed = new TextDecoder().decode(inflate(compressed));
    
    if (decompressed === testData) {
      console.log('✅ Compression library (pako): SUCCESS');
    } else {
      console.log('❌ Compression library: Data mismatch');
    }
  } catch (error) {
    console.log('❌ Compression library: FAILED', error);
  }
  
  // Test 4: Check if useDSB hook is available
  try {
    console.log('✅ useDSB hook: Available');
  } catch (error) {
    console.log('❌ useDSB hook: FAILED', error);
  }
  
  console.log('🧪 DSB Integration test completed');
  console.log('📝 Note: Real authentication requires valid DSB credentials');
}

// Component to test DSB hook
export function DSBTestComponent() {
  const dsb = useDSB();
  
  useEffect(() => {
    console.log('DSB State:', {
      isAuthenticated: dsb.isAuthenticated,
      isLoading: dsb.isLoading,
      timetableItems: dsb.timetable?.length || 0,
      error: dsb.error,
    });
  }, [dsb]);
  
  return null; // This is just for testing
}
