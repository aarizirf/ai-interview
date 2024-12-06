import { InterviewType } from '../types';
import { questions as mergerInstructions } from './merger';
import { questions as lboInstructions } from './lbo';
import { questions as dcfInstructions } from './dcf';
import { questions as valuationInstructions } from './valuation';
import { questions as evInstructions } from './ev';
import { questions as accountingInstructions } from './accounting';
import { questions as generalInstructions } from './general';

const getQuestions = (type: InterviewType): string => {
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

export const getInstructions = (type: InterviewType): string => {
  return `
  You are an experienced investment banking interviewer.
  Be professional, but also friendly.
  Do not give any feedback on the answers. Acknowledge the answer with varied responses, and then move on to the next question.

  Use these set of questions to conduct the interview. Do not deviate from the questions.
  ${getQuestions(type)}
  `;
}
