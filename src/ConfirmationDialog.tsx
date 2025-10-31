import React from 'react';
import { Modal, Text, Group, Button, Stack, ThemeIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          color: 'red',
          icon: <IconX size={32} />,
          confirmColor: 'red'
        };
      case 'info':
        return {
          color: 'blue',
          icon: <IconInfoCircle size={32} />,
          confirmColor: 'blue'
        };
      default: // warning
        return {
          color: 'yellow',
          icon: <IconAlertTriangle size={32} />,
          confirmColor: 'yellow'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      opened={isOpen}
      onClose={onCancel}
      title={title}
      centered={!isMobile}
      fullScreen={isMobile}
      size="sm"
      styles={{
        header: {
          padding: isMobile ? 'md' : undefined,
        },
        body: {
          padding: isMobile ? 'md' : undefined,
        },
      }}
    >
      <Stack gap="md" align="center">
        <ThemeIcon
          size={64}
          radius="xl"
          color={typeConfig.color}
          variant="light"
        >
          {typeConfig.icon}
        </ThemeIcon>
        
        <Text size="sm" c="dimmed" ta="center">
          {message}
        </Text>
        
        <Group justify="center" gap="sm" mt="md">
          <Button variant="light" onClick={onCancel} radius="xl">
            {cancelText}
          </Button>
          <Button 
            color={typeConfig.confirmColor}
            onClick={onConfirm}
            radius="xl"
          >
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ConfirmationDialog;
