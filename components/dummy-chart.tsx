import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';

const data = [
  { quarter: 1, earnings: 13000 },
  { quarter: 2, earnings: 16500 },
  { quarter: 3, earnings: 14250 },
  { quarter: 4, earnings: 19000 }
];

const DummyChart = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Victory Native Demo (Modern)</Text>
      <View style={{ height: 300, width: 350 }}>
        <CartesianChart
          data={data}
          xKey="quarter"
          yKeys={["earnings"]}
          axisOptions={{
            font: undefined, // Uses default font
            formatXLabel: (value) => `Q${value}`,
            formatYLabel: (value) => `$${value / 1000}k`,
          }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.earnings}
              chartBounds={chartBounds}
              color="#c43a31"
              roundedCorners={{
                topLeft: 4,
                topRight: 4,
              }}
            />
          )}
        </CartesianChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});

export default DummyChart;
