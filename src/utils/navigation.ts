import { NavigateFunction } from 'react-router-dom';
import { InterviewType } from './types';

interface NavigationOptions {
  type: InterviewType;
}

export const navigateToInterview = (
  navigate: NavigateFunction,
  options: NavigationOptions
) => {
  navigate('/console', { 
    state: { 
      type: options.type 
    }
  });
}; 