import { InterviewType } from '../types';
import { questions as mergerInstructions } from './merger';
import { questions as lboInstructions } from './lbo';
import { questions as dcfInstructions } from './dcf';
import { questions as valuationInstructions } from './valuation';
import { questions as evInstructions } from './ev';
import { questions as accountingInstructions } from './accounting';
import { questions as generalInstructions } from './general';

export const getQuestions = (type: InterviewType): string => {
  switch(type) {
    case InterviewType.Merger:
      return mergerInstructions;
    case InterviewType.LBO:
      return lboInstructions;
    case InterviewType.DCF:
      return dcfInstructions;
    case InterviewType.Valuation:
      return valuationInstructions;
    case InterviewType.Enterprise:
      return evInstructions;
    case InterviewType.Accounting:
      return accountingInstructions;
    case InterviewType.General:
      return generalInstructions;
    default:
      return '';
  }
};

export const getInstructions = (questions: string, tone: string, voiceSpeed: string): string => {
    let toneInstructions = '';
    let speedInstructions = '';

    switch(tone) {
        case 'Professional':
            toneInstructions = 'Do not give any feedback on the answers. Be stern and a little cold.';
            break;
        case 'Warm':
            toneInstructions = 'Be friendly, but do not give any feedback.';
            break;
        case 'Helpful':
            toneInstructions = 'Nudge the candidate in the right direction, but do not give the answer. Give short responses.';
            break;
    }

    switch(voiceSpeed) {
        case 'Slow':
            speedInstructions = 'Speak very, very slowly.';
            break;
        case 'Normal':
            speedInstructions = 'Speak at a normal pace.';
            break;
        case 'Fast':
            speedInstructions = 'Speak very quickly, and rush through your questions.';
            break;
    }

    return `
        You are an experienced investment banking interviewer.
        Simulate an interview with me.
        Do not deviate from these questions at all:
        ${questions}


        ${toneInstructions} ${speedInstructions}
        Wait for my response before asking the next question. Randomize the order of the questions.
    `;
}
