// eslint-disable-next-line import/prefer-default-export

import { vec3 } from '../common/ext/index.js';

export class Patient {
  constructor(startPosition, direction, state, id) {
    this.startPosition = startPosition;
    this.id = id;
    this.stepsDone = 0;
    this.currentPosition = startPosition;
    this.direction = direction;
    this.state = state;
    this.alreadyTurned = false;
    this.speed = (Math.random() * ((0.10 - 0.01) + 0.01)).toFixed(2);
    this.step = this.calcStep();
  }

  calcStep() {
    return vec3.scale(vec3.create(), this.direction, this.speed);
  }

  turnAround() {
    if (this.alreadyTurned) {
      return;
    }
    const audio = new Audio('click.wav');
    audio.volume = 0.05;
    audio.play();

    this.direction = vec3.negate(vec3.create(), this.direction);
    this.step = this.calcStep();
    this.alreadyTurned = true;
  }

  move(stepsUntilHealing) {
    this.alreadyTurned = false;
    let newPosition = vec3.add(vec3.create(), this.currentPosition, this.step);
    newPosition = this.handleCubeCollision(newPosition);

    this.currentPosition = newPosition;
    this.stepsDone++;

    if (this.stepsDone >= stepsUntilHealing && this.state === PatientState.SICK) {
      if (document.getElementById('immunity').checked) {
        this.state = PatientState.IMMUNE;
      } else {
        this.state = PatientState.HEALTHY;
      }
    }
  }

  handleCollisionWithOthers(patients, infectionProbability) {
    patients.forEach((patient) => {
      if (patient.id !== this.id && intersect(patient.currentPosition, this.currentPosition)) {
        this.turnAround();
        patient.turnAround();
        if (this.state === PatientState.SICK
          && patient.state === PatientState.HEALTHY
          && infectionProbability >= Math.random()) {
          patient.state = PatientState.SICK;
          patient.stepsDone = 0;
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  handleCubeCollision(newPosition) {
    let [x, y, z] = newPosition;

    if (x > 2.5) {
      newPosition = vec3.fromValues(-2.5, y, z);
      x = -2.5;
    }

    if (x < -2.5) {
      newPosition = vec3.fromValues(2.5, y, z);
      x = 2.5;
    }

    if (y > 2.5) {
      newPosition = vec3.fromValues(x, -2.5, z);
      y = -2.5;
    }

    if (y < -2.5) {
      newPosition = vec3.fromValues(x, 2.5, z);
      y = 2.5;
    }

    if (z > 2.5) {
      newPosition = vec3.fromValues(x, y, -2.5);
      z = -2.5;
    }

    if (z < -2.5) {
      newPosition = vec3.fromValues(x, y, 2.5);
      z = 2.5;
    }

    return newPosition;
  }
}

function intersect(patientPosition, otherPosition) {
  const [patientX, patientY, patientZ] = patientPosition;
  const [otherX, otherY, otherZ] = otherPosition;
  const distance = Math.sqrt((patientX - otherX) * (patientX - otherX)
    + (patientY - otherY) * (patientY - otherY)
    + (patientZ - otherZ) * (patientZ - otherZ));
  return distance < (0.25 + 0.25);
}

export const createRandomPatient = (state, id) => new Patient(
  getRandomStartPoint(),
  getRandomDirection(),
  state,
  id,
);

// debug method only
export const createTestPatients = () => [
  new Patient([-2.4, 0, 0], [2.5, 0, 0], PatientState.SICK, 1),
  new Patient([2.4, 0, 0], [-2.5, 0, 0], PatientState.HEALTHY, 2),
];

const getRandomStartPoint = () => {
  const randomX = getRandomPointOnAxis();
  const randomY = getRandomPointOnAxis();
  const randomZ = getRandomPointOnAxis();
  return vec3.fromValues(randomX, randomY, randomZ);
};

const getRandomDirection = () => {
  // choose which "main" direction = x, -x, y, -y, z, -z
  const mainDirections = ['x', 'minusx', 'y', 'minusy', 'z', 'minusz'];
  const mainDirection = mainDirections[Math.floor(Math.random() * mainDirections.length)];

  const turn1 = getRandomPointOnAxis();
  const turn2 = getRandomPointOnAxis();
  const max = 2.5;

  if (mainDirection.includes('x')) {
    return mainDirection.includes('minus') ? vec3.fromValues(-max, turn1, turn2) : vec3.fromValues(max, turn1, turn2);
  }

  if (mainDirection.includes('y')) {
    return mainDirection.includes('minus') ? vec3.fromValues(turn1, -max, turn2) : vec3.fromValues(turn1, max, turn2);
  }

  if (mainDirection.includes('z')) {
    return mainDirection.includes('minus') ? vec3.fromValues(turn1, turn2, -max) : vec3.fromValues(turn1, turn2, max);
  }

  throw new Error('Should provide valid direction');
};

const getRandomPointOnAxis = () => {
  const min = 0;
  const max = 2.500;
  const randomSign = Math.random() < 0.5;

  const randomPoint = (Math.random() * ((max - min) + min)).toFixed(3);
  return parseFloat(randomSign ? randomPoint * -1 : randomPoint);
};

export const PatientState = Object.freeze({
  SICK: { color: [1.0, 0.0, 0.0, 1.0] },
  HEALTHY: { color: [0.0, 1.0, 0.0, 1.0] },
  IMMUNE: { color: [0.0, 0.0, 1.0, 1.0] },
});

export const stateMapping = {
  healthyPatients: PatientState.HEALTHY,
  immunePatients: PatientState.IMMUNE,
  sickPatients: PatientState.SICK,
};
