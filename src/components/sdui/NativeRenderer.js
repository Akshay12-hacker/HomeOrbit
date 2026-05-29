import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Layout from '../ui/Layout';

const componentMap = {
  'Button': Button,
  'Badge': Badge,
  'Card': Card,
  'Layout': Layout,
  'View': View,
  'Text': Text,
  'ScrollView': ScrollView,
};

const NativeRenderer = ({ schema }) => {
  if (!schema) return null;

  const renderComponent = (item, index) => {
    const { type, props, children } = item;
    const Component = componentMap[type];

    if (!Component) {
      console.warn(`SDUI: Component type "${type}" not found.`);
      return null;
    }

    // Recursively render children if they exist and are an array
    const renderedChildren = Array.isArray(children)
      ? children.map((child, i) => renderComponent(child, i))
      : children;

    return (
      <Component key={index} {...props}>
        {renderedChildren}
      </Component>
    );
  };

  return (
    <View style={styles.container}>
      {Array.isArray(schema) 
        ? schema.map((item, i) => renderComponent(item, i))
        : renderComponent(schema, 0)
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NativeRenderer;
