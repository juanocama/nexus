import { Platform, Alert as RNAlert } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const useConfirm = buttons.length === 2;
      if (useConfirm) {
        const result = window.confirm(message ? `${title}\n\n${message}` : title);
        if (result && buttons[1].onPress) {
          buttons[1].onPress();
        } else if (!result && buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        window.alert(message ? `${title}\n\n${message}` : title);
        if (buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
  } else {
    if (buttons && buttons.length > 0) {
      RNAlert.alert(title, message, buttons);
    } else {
      RNAlert.alert(title, message);
    }
  }
}

export function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    showAlert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Aceptar', onPress: () => resolve(true) },
    ]);
  });
}
