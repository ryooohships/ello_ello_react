import React, { createContext, useContext, useEffect, useState } from 'react';
import { ServiceContainer } from './core/ServiceContainer';
import { UserService } from './core/UserService';
import { CallManager } from './managers/CallManager';
import { CallLogService } from './managers/CallLogService';
import { ContactsManager } from './managers/ContactsManager';
import { ITwilioService } from './twilio/ITwilioService';
import { TwilioService } from './twilio/TwilioService';
import { MockTwilioService } from './twilio/MockTwilioService';
import { appConfig } from '../config/appConfig';
import { AudioManager } from './audio/AudioManager';
import { CallRecordingService } from './backend/CallRecordingService';
import { VoicemailService } from './backend/VoicemailService';
import { PushNotificationService } from './notifications/PushNotificationService';
import LoadingScreen from '../views/components/LoadingScreen';

interface ServiceProviderValue {
  userService: UserService;
  callManager: CallManager;
  callLogService: CallLogService;
  contactsManager: ContactsManager;
  audioManager: AudioManager;
  callRecordingService: CallRecordingService;
  voicemailService: VoicemailService;
  pushNotificationService: PushNotificationService;
  twilioService: ITwilioService;
  isInitialized: boolean;
}

const ServiceContext = createContext<ServiceProviderValue | null>(null);

export function useServices(): ServiceProviderValue {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}

interface ServiceProviderProps {
  children: React.ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [services, setServices] = useState<ServiceProviderValue | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      const container = ServiceContainer.getInstance();
      
      // Initialize services
      const userService = new UserService();
      const callLogService = new CallLogService();
      const contactsManager = new ContactsManager();
      const audioManager = new AudioManager();
      const callRecordingService = new CallRecordingService();
      const voicemailService = new VoicemailService();
      const pushNotificationService = new PushNotificationService();
      const twilioService = appConfig.useMockTwilio ? new MockTwilioService() : new TwilioService();
      const callManager = new CallManager();

      // Initialize services
      await audioManager.initialize();
      await callRecordingService.initialize();
      await voicemailService.initialize();
      await pushNotificationService.initialize();

      // Inject dependencies
      callManager.setCallLogService(callLogService);
      callManager.setContactsManager(contactsManager);
      callManager.setAudioManager(audioManager);
      callManager.setCallRecordingService(callRecordingService);
      callManager.setTwilioService(twilioService);

      // Register services with container
      container.register('userService', userService);
      container.register('callLogService', callLogService);
      container.register('contactsManager', contactsManager);
      container.register('audioManager', audioManager);
      container.register('callRecordingService', callRecordingService);
      container.register('voicemailService', voicemailService);
      container.register('pushNotificationService', pushNotificationService);
      container.register('twilioService', twilioService);
      container.register('callManager', callManager);

      // Initialize Twilio (in production, you'd get the token from your backend)
      await twilioService.initialize();
      await twilioService.refreshAccessToken();

      setServices({
        userService,
        callManager,
        callLogService,
        contactsManager,
        audioManager,
        callRecordingService,
        voicemailService,
        pushNotificationService,
        twilioService,
        isInitialized: true,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      // Still set services even if Twilio fails (for development)
      const userService = new UserService();
      const callLogService = new CallLogService();
      const contactsManager = new ContactsManager();
      const audioManager = new AudioManager();
      const callRecordingService = new CallRecordingService();
      const voicemailService = new VoicemailService();
      const pushNotificationService = new PushNotificationService();
      const twilioService = appConfig.useMockTwilio ? new MockTwilioService() : new TwilioService();
      const callManager = new CallManager();

      try {
        await audioManager.initialize();
        await callRecordingService.initialize();
        await pushNotificationService.initialize();
      } catch (serviceError) {
        console.warn('Service initialization failed:', serviceError);
      }

      // Inject dependencies even in error case
      callManager.setCallLogService(callLogService);
      callManager.setContactsManager(contactsManager);
      callManager.setAudioManager(audioManager);
      callManager.setCallRecordingService(callRecordingService);
      callManager.setTwilioService(twilioService);

      setServices({
        userService,
        callManager,
        callLogService,
        contactsManager,
        audioManager,
        callRecordingService,
        voicemailService,
        pushNotificationService,
        twilioService,
        isInitialized: true,
      });
      setIsInitialized(true);
    }
  };

  if (!services || !isInitialized) {
    return <LoadingScreen message="Initializing services..." />;
  }

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}