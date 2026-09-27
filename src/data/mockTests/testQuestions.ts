import { Question } from './types';
import { unitsVectorsQuestions } from './questions/unitsVectorsQuestions';
import { kinematics1dQuestions } from './questions/kinematics1dQuestions';
import { kinematics2dQuestions } from './questions/kinematics2dQuestions';
import { nlmFrictionQuestions } from './questions/nlmFrictionQuestions';
import { circularMotionQuestions } from './questions/circularMotionQuestions';
import { workEnergyQuestions } from './questions/workEnergyQuestions';
import { centerOfMassQuestions } from './questions/centerOfMassQuestions';
import { rotationalDynamicsQuestions } from './questions/rotationalDynamicsQuestions';
import { shmQuestions } from './questions/shmQuestions';
import { thermodynamicsQuestions } from './questions/thermodynamicsQuestions';

export const ALL_QUESTIONS: Question[] = [
  ...unitsVectorsQuestions,
  ...kinematics1dQuestions,
  ...kinematics2dQuestions,
  ...nlmFrictionQuestions,
  ...circularMotionQuestions,
  ...workEnergyQuestions,
  ...centerOfMassQuestions,
  ...rotationalDynamicsQuestions,
  ...shmQuestions,
  ...thermodynamicsQuestions,
];
