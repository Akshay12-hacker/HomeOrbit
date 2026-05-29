import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  spacing,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { useScroll } from '../../theme/ScrollContext';

import { HomeTopBar, HomeHero } from '../../components/home/HomeHeader';
import PlotCarousel from '../../components/home/PlotCarousel';
import DashboardStats from '../../components/home/DashboardStats';
import QuickActions from '../../components/home/QuickAction';
import AnnouncementList from '../../components/home/AnnouncementList';
import RecentPayments from '../../components/home/RecentPaymentsList';
import SocietyFundCard from '../../components/home/SocietyFundCard';
import HomeSkeleton from '../../components/home/HomeSkeleton';
import SidebarMenu from '../../components/home/SidebarMenu';
import ErrorModal from '../../components/modals/ErrorModal';
import useDashboard from '../../hooks/home/useDashboard';

export default function HomeScreen({
  navigation,
}) {
  const { colors } = useTheme();
  const { setTabBarVisible } = useScroll();
  const lastOffset = React.useRef(0);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastOffset.current ? 'down' : 'up';

    if (Math.abs(currentOffset - lastOffset.current) > 20) {
      setTabBarVisible(direction === 'up' || currentOffset <= 0);
    }

    lastOffset.current = currentOffset;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.screen,
      paddingTop: spacing.sm,
      paddingBottom: 112,
    },
  });

  const [
    sidebarVisible,
    setSidebarVisible,
  ] = React.useState(false);

  const [showError, setShowError] = React.useState(false);

  const {
    loading,
    error,
    refresh,
    refreshing,
    dashboard,
    plots,
    activePlot,
    activePlotIndex,
    setActivePlotIndex,
    recentPayments,
    societyFund,
  } = useDashboard();

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    navigation.replace('Error', {
      title: 'Dashboard Error',
      message: 'We couldn\'t load your dashboard. Please check your connection or try again.',
    });
    return null;
  }

  return (
    <>
      <SidebarMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />

      <HomeTopBar
        userName={dashboard?.user?.name}
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
      >
        <HomeHero
          userName={dashboard?.user?.name}
          societyName={activePlot?.societyName}
          plotName={activePlot?.plotNo}
        />

        <PlotCarousel
          plots={plots}
          activeIndex={activePlotIndex}
          onChange={setActivePlotIndex}
        />

        <View style={styles.content}>
          <DashboardStats
            plot={activePlot}
            onPayPress={() =>
              navigation.navigate('Maintenance', { 
                initialPlotIndex: activePlotIndex 
              })
            }
            onHistoryPress={() =>
              navigation.navigate('History')
            }
          />

          <QuickActions
            onActionPress={(action) => {
              setShowError(true);
            }}
          />

          <SocietyFundCard
            fund={societyFund}
            onPress={() => navigation.navigate('SocietyFund')}
          />

          <AnnouncementList
            announcements={dashboard?.announcements || []}
          />

          <RecentPayments
            payments={recentPayments}
            onSeeAll={() => navigation.navigate('History')}
            onPaymentPress={(payment) =>
              navigation.navigate('Receipt', { payment })
            }
          />
        </View>
      </ScrollView>

      <ErrorModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Feature Unavailable"
        message="This feature is currently under development and will be available in the next update."
      />
    </>
  );
}
