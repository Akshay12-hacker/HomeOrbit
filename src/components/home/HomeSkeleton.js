import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  radius,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

import Skeleton from '../ui/Skeleton';

export default function HomeSkeleton() {
  const { colors, isDark } = useTheme();

  const styles =
    StyleSheet.create({
      container: {
        flex: 1,

        backgroundColor:
          colors.background,
      },

      hero: {
        paddingTop: 64,

        paddingHorizontal: 20,

        paddingBottom: 30,
      },

      header: {
        flexDirection: 'row',

        justifyContent:
          'space-between',

        alignItems: 'center',

        marginBottom: 28,
      },

      skeletonDark: {
        backgroundColor:
          isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.16)',
      },

      plotCard: {
        backgroundColor:
          isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',

        borderRadius:
          radius.xl,

        padding: 22,
      },

      plotBottom: {
        flexDirection: 'row',

        justifyContent:
          'space-between',

        alignItems: 'flex-end',

        marginTop: 24,
      },

      body: {
        paddingHorizontal: 20,

        paddingTop: 22,

        paddingBottom: 40,
      },

      stats: {
        flexDirection: 'row',

        gap: 14,

        marginBottom: 28,
      },

      statCard: {
        flex: 1,

        backgroundColor:
          colors.surface,

        borderRadius:
          radius.card,

        padding: 18,
      },

      section: {
        marginBottom: 30,
      },

      quickRow: {
        flexDirection: 'row',

        marginTop: 18,

        gap: 14,
      },

      quickItem: {
        width: 110,

        backgroundColor:
          colors.surface,

        borderRadius:
          radius.card,

        paddingVertical: 20,

        alignItems: 'center',
      },

      fundCard: {
        backgroundColor:
          colors.surface,

        borderRadius:
          radius.xl,

        padding: 22,

        marginBottom: 30,
      },

      fundStats: {
        flexDirection: 'row',

        justifyContent:
          'space-between',

        marginTop: 24,
      },

      paymentCard: {
        backgroundColor:
          colors.surface,

        borderRadius:
          radius.xl,

        marginTop: 18,

        overflow: 'hidden',
      },

      paymentRow: {
        flexDirection: 'row',

        alignItems: 'center',

        paddingHorizontal: 18,

        paddingVertical: 18,
      },
    });

  return (
    <View style={styles.container}>
      {/* HERO */}
      <LinearGradient
        colors={colors.gradientHero}
        style={styles.hero}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Skeleton
              width={110}
              height={12}
              style={
                styles.skeletonDark
              }
            />

            <Skeleton
              width={170}
              height={28}
              style={[
                styles.skeletonDark,
                {
                  marginTop: 12,
                },
              ]}
            />
          </View>

          <Skeleton
            width={48}
            height={48}
            borderRadius={24}
            style={
              styles.skeletonDark
            }
          />
        </View>

        {/* PLOT CARD */}
        <View style={styles.plotCard}>
          <Skeleton
            width={140}
            height={12}
          />

          <Skeleton
            width={90}
            height={28}
            style={{
              marginTop: 14,
            }}
          />

          <Skeleton
            width={120}
            height={12}
            style={{
              marginTop: 14,
            }}
          />

          <View
            style={
              styles.plotBottom
            }
          >
            <View>
              <Skeleton
                width={100}
                height={10}
              />

              <Skeleton
                width={90}
                height={22}
                style={{
                  marginTop: 10,
                }}
              />
            </View>

            <Skeleton
              width={20}
              height={20}
              borderRadius={10}
            />
          </View>
        </View>
      </LinearGradient>

      {/* BODY */}
      <View style={styles.body}>
        {/* STATS */}
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Skeleton
              width={80}
              height={10}
            />

            <Skeleton
              width={100}
              height={24}
              style={{
                marginTop: 12,
              }}
            />

            <Skeleton
              width={90}
              height={34}
              borderRadius={12}
              style={{
                marginTop: 16,
              }}
            />
          </View>

          <View style={styles.statCard}>
            <Skeleton
              width={80}
              height={10}
            />

            <Skeleton
              width={100}
              height={24}
              style={{
                marginTop: 12,
              }}
            />

            <Skeleton
              width={90}
              height={34}
              borderRadius={12}
              style={{
                marginTop: 16,
              }}
            />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View
          style={styles.section}
        >
          <Skeleton
            width={150}
            height={18}
          />

          <View
            style={
              styles.quickRow
            }
          >
            {[1, 2, 3].map(
              (item) => (
                <View
                  key={item}
                  style={
                    styles.quickItem
                  }
                >
                  <Skeleton
                    width={50}
                    height={50}
                    borderRadius={
                      25
                    }
                  />

                  <Skeleton
                    width={60}
                    height={12}
                    style={{
                      marginTop: 14,
                    }}
                  />
                </View>
              )
            )}
          </View>
        </View>

        {/* FUND CARD */}
        <View
          style={
            styles.fundCard
          }
        >
          <Skeleton
            width={120}
            height={12}
          />

          <Skeleton
            width={180}
            height={34}
            style={{
              marginTop: 18,
            }}
          />

          <Skeleton
            width="100%"
            height={8}
            borderRadius={4}
            style={{
              marginTop: 22,
            }}
          />

          <View
            style={
              styles.fundStats
            }
          >
            <Skeleton
              width={70}
              height={34}
            />

            <Skeleton
              width={70}
              height={34}
            />
          </View>
        </View>

        {/* PAYMENTS */}
        <View
          style={styles.section}
        >
          <Skeleton
            width={170}
            height={18}
          />

          <View
            style={
              styles.paymentCard
            }
          >
            {[1, 2, 3].map(
              (item) => (
                <View
                  key={item}
                  style={
                    styles.paymentRow
                  }
                >
                  <Skeleton
                    width={46}
                    height={46}
                    borderRadius={
                      23
                    }
                  />

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 14,
                    }}
                  >
                    <Skeleton
                      width={150}
                      height={12}
                    />

                    <Skeleton
                      width={100}
                      height={10}
                      style={{
                        marginTop: 10,
                      }}
                    />
                  </View>

                  <Skeleton
                    width={70}
                    height={24}
                  />
                </View>
              )
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
