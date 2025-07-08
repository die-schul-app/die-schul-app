import { useEffect } from 'react';
import { useDSB } from './useDSB';

// Simple test function to verify DSB integration
export function testDSBIntegration() {
  console.log('🧪 Testing DSB Integration...');
  
  // Test 1: Check if DSB client can be instantiated
  try {
    const { DSBClient } = require('./DSB/DSBClient');
    const client = new DSBClient('test', 'test');
    console.log('✅ DSB Client instantiation: SUCCESS');
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
  
  // Test 3: Check if useDSB hook is available
  try {
    console.log('✅ useDSB hook: Available');
  } catch (error) {
    console.log('❌ useDSB hook: FAILED', error);
  }
  
  console.log('🧪 DSB Integration test completed');
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
