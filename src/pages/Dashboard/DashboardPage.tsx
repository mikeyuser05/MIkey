import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RefreshCw, Download } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { Button } from '@components/ui/Button';
import { Container } from '@components/ui/Container';
import {
  DashboardGrid,
  HeartRateCard,
  SpO2Card,
  StepsCard,
  TemperatureCard,
  GasCard,
  BatteryCard,
  ConnectionCard,
  AlarmCard,
  DeviceStatusPanel,
  RecentEventsPanel,
  QuickActionsPanel,
  SystemStatusCard,
} from '@components/dashboard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardPage(): ReactElement {
  const handleRefresh = (): void => {
    toast.success('Dashboard refreshed (placeholder data)');
  };

  const handleExport = (): void => {
    toast('Export is coming in a future PR.', { icon: '🚧' });
  };

  return (
    <Container size="xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Dashboard"
            description="Real-time overview of vitals, device health, and system status."
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleExport}
                >
                  Export
                </Button>
              </>
            }
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardGrid>
            <HeartRateCard />
            <SpO2Card />
            <StepsCard />
            <TemperatureCard />
            <GasCard />
            <BatteryCard />
            <ConnectionCard />
            <AlarmCard />
          </DashboardGrid>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DeviceStatusPanel />
          </div>
          <div className="lg:col-span-1">
            <RecentEventsPanel />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-1">
            <QuickActionsPanel />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SystemStatusCard />
        </motion.div>
      </motion.div>
    </Container>
  );
}
