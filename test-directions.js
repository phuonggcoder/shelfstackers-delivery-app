// File demo để test chức năng chỉ đường
// Chạy với: node test-directions.js

const { MapsService } = require('./lib/mapsConfig');

// Test data - địa chỉ và tọa độ mẫu
const testAddresses = [
  {
    name: 'TP.HCM - Quận 1',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    coordinates: { lat: 10.762622, lng: 106.660172 }
  },
  {
    name: 'Hà Nội - Ba Đình',
    address: '456 Đường Trần Phú, Ba Đình, Hà Nội',
    coordinates: { lat: 21.0285, lng: 105.8542 }
  },
  {
    name: 'Đà Nẵng - Hải Châu',
    address: '789 Đường Trần Hưng Đạo, Hải Châu, Đà Nẵng',
    coordinates: { lat: 16.0544, lng: 108.2022 }
  }
];

// Test functions
async function testMapsService() {
  console.log('🧪 Testing MapsService...\n');

  // Test 1: Validate coordinates
  console.log('1. Testing coordinate validation:');
  testAddresses.forEach((test, index) => {
    const isValid = MapsService.validateCoordinates(test.coordinates.lat, test.coordinates.lng);
    console.log(`   ${index + 1}. ${test.name}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });

  // Test 2: GeoJSON conversion
  console.log('\n2. Testing GeoJSON conversion:');
  testAddresses.forEach((test, index) => {
    const geoJSON = MapsService.toGeoJSON(test.coordinates.lat, test.coordinates.lng);
    console.log(`   ${index + 1}. ${test.name}:`, geoJSON);
  });

  // Test 3: URL generation
  console.log('\n3. Testing URL generation:');
  testAddresses.forEach((test, index) => {
    const encodedAddress = encodeURIComponent(test.address);
    const googleMapsUrl = `https://maps.google.com/maps?daddr=${encodedAddress}`;
    const appleMapsUrl = `https://maps.apple.com/maps?daddr=${encodedAddress}`;
    
    console.log(`   ${index + 1}. ${test.name}:`);
    console.log(`      Google Maps: ${googleMapsUrl}`);
    console.log(`      Apple Maps: ${appleMapsUrl}`);
  });

  // Test 4: Address parsing (mock data)
  console.log('\n4. Testing address parsing:');
  const mockGeocodingResult = {
    address_components: [
      { types: ['route'], long_name: 'Đường Lê Lợi' },
      { types: ['sublocality_level_1'], long_name: 'Phường Bến Nghé' },
      { types: ['administrative_area_level_2'], long_name: 'Quận 1' },
      { types: ['administrative_area_level_1'], long_name: 'TP.HCM' },
      { types: ['country'], long_name: 'Vietnam' }
    ],
    formatted_address: 'Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM, Vietnam',
    place_id: 'ChIJ...'
  };

  const parsedAddress = MapsService.parseAddress(mockGeocodingResult);
  console.log('   Parsed address:', parsedAddress);
}

// Test coordinate validation edge cases
function testCoordinateValidation() {
  console.log('\n🧪 Testing coordinate validation edge cases:');
  
  const testCases = [
    { lat: 0, lng: 0, expected: true, name: 'Origin (0,0)' },
    { lat: 90, lng: 180, expected: true, name: 'Max positive' },
    { lat: -90, lng: -180, expected: true, name: 'Max negative' },
    { lat: 91, lng: 0, expected: false, name: 'Lat > 90' },
    { lat: 0, lng: 181, expected: false, name: 'Lng > 180' },
    { lat: null, lng: 0, expected: false, name: 'Null lat' },
    { lat: 0, lng: undefined, expected: false, name: 'Undefined lng' },
    { lat: 'invalid', lng: 0, expected: false, name: 'String lat' }
  ];

  testCases.forEach((testCase, index) => {
    const result = MapsService.validateCoordinates(testCase.lat, testCase.lng);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${index + 1}. ${testCase.name}: ${status} (Expected: ${testCase.expected}, Got: ${result})`);
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Directions Integration Tests\n');
  console.log('=' .repeat(60));
  
  try {
    await testMapsService();
    testCoordinateValidation();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('\n📱 To test in React Native app:');
    console.log('   1. Import AddressWithDirections component');
    console.log('   2. Use in order detail or order list pages');
    console.log('   3. Tap on compass icon to open directions');
    console.log('   4. Check Google Maps integration');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testMapsService,
  testCoordinateValidation,
  runTests
};
