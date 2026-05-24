import React from 'react';

import {
  getDashboard,
  getDashboardPlotDetails,
  getDashboardRecentPayments,
  getDashboardSocietyFund,
  clearDashboardCache,
} from '../../services';

export default function useDashboard() {
  const [loading, setLoading] =
    React.useState(true);

  const [refreshing, setRefreshing] =
    React.useState(false);

  const [error, setError] =
    React.useState(null);

  const [dashboard, setDashboard] =
    React.useState(null);

  const [activePlotIndex, setActivePlotIndex] =
    React.useState(0);

  const [plotDetails, setPlotDetails] =
    React.useState({});

  const [recentPayments, setRecentPayments] =
    React.useState([]);

  const [societyFund, setSocietyFund] =
    React.useState(null);

  const loadDashboard =
    React.useCallback(
      async (
        forceRefresh = false
      ) => {
        try {
          setError(null);

          if (forceRefresh) {
            clearDashboardCache();
          }

          const data =
            await getDashboard();

          setDashboard(data);
        } catch (err) {
          setError(
            err?.message ||
              'Failed to load dashboard.'
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const plots =
    dashboard?.plots || [];

  const mergedPlots = React.useMemo(() => {
    return plots.map(p => {
      if (!plotDetails[p.id]) return p;
      return { ...p, ...plotDetails[p.id] };
    });
  }, [plots, plotDetails]);

  const activePlot = React.useMemo(() => {
    return mergedPlots[activePlotIndex] || null;
  }, [mergedPlots, activePlotIndex]);

  const loadPlotDetails =
    React.useCallback(
      async () => {
        if (
          !activePlot?.id
        )
          return;

        try {
          const details =
            await getDashboardPlotDetails(
              activePlot
            );

          setPlotDetails(
            (prev) => ({
              ...prev,

              [activePlot.id]:
                details,
            })
          );
        } catch (_err) {}
      },
      [activePlot]
    );

  const loadPayments =
    React.useCallback(
      async () => {
        if (
          !activePlot?.id
        )
          return;

        try {
          const payments =
            await getDashboardRecentPayments(
              activePlot
            );

          setRecentPayments(
            payments || []
          );
        } catch (_err) {}
      },
      [activePlot]
    );

  const loadFund =
    React.useCallback(
      async () => {
        if (
          !dashboard?.society
            ?.id
        )
          return;

        try {
          const fund =
            await getDashboardSocietyFund(
              dashboard.society
                .id
            );

          setSocietyFund(
            fund
          );
        } catch (_err) {}
      },
      [dashboard]
    );

  React.useEffect(() => {
    loadPlotDetails();

    loadPayments();
  }, [
    activePlotIndex,
    loadPayments,
    loadPlotDetails,
  ]);

  React.useEffect(() => {
    loadFund();
  }, [loadFund]);

  const refresh =
    React.useCallback(
      async () => {
        setRefreshing(
          true
        );

        await loadDashboard(
          true
        );
      },
      [loadDashboard]
    );

  return {
    loading,

    refreshing,

    error,

    refresh,

    dashboard,

    plots: mergedPlots,

    activePlot,

    activePlotIndex,

    setActivePlotIndex,

    plotDetails,

    recentPayments,

    societyFund,
  };
}