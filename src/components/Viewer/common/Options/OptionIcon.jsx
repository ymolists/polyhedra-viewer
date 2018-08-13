// @flow strict
import _ from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import { makeStyles } from 'styles';

import { Polygon, PolyLine, PolyShape, polygonPoints } from 'components/svg';

const color = 'DimGray';
const styles = makeStyles({
  icon: {
    width: 40,
    height: 40,
  },

  outer: {
    stroke: color,
    fill: 'none',
    strokeWidth: 8,
    strokeLinejoin: 'round',
  },

  inner: {
    stroke: color,
    fill: 'none',
    strokeWidth: 5,
    strokeLinejoin: 'round',
  },
});

interface Props {
  name: 'ortho' | 'gyro' | 'pyramid' | 'fastigium' | 'cupola' | 'rotunda';
}

function drawIcon(name) {
  switch (name) {
    case 'ortho':
      return (
        <Fragment>
          <Polygon
            className={styles('outer')}
            n={5}
            cx={100}
            cy={100}
            a={90}
            r={100}
          />
          <Polygon
            className={styles('inner')}
            n={5}
            cx={100}
            cy={100}
            a={90}
            r={66}
          />
        </Fragment>
      );
    case 'gyro':
      return (
        <Fragment>
          <Polygon
            className={styles('outer')}
            n={5}
            cx={100}
            cy={100}
            a={90}
            r={100}
          />
          <Polygon
            className={styles('inner')}
            n={5}
            cx={100}
            cy={100}
            a={-90}
            r={66}
          />
        </Fragment>
      );
    case 'pyramid':
      return (
        <Fragment>
          <PolyShape
            className={styles('outer')}
            points={[[100, 50], [10, 170], [190, 170]]}
          />
          <PolyLine
            className={styles('inner')}
            points={[[140, 170], [100, 50], [60, 170]]}
          />
        </Fragment>
      );
    case 'fastigium': {
      const center = 100;
      const height = 50;
      const topY = center - height;
      const bottomY = center + height;
      return (
        <Fragment>
          <PolyShape
            className={styles('outer')}
            points={[[150, topY], [50, topY], [10, bottomY], [190, bottomY]]}
          />
          <PolyLine
            className={styles('inner')}
            points={[[150, topY], [120, bottomY]]}
          />
        </Fragment>
      );
    }
    case 'cupola': {
      const center = 100;
      const height = 50;
      const topY = center - height;
      const bottomY = center + height;
      const topWidth = 50;
      const bottomWidth = 90;
      const topLeftX = center - topWidth;
      const topRightX = center + topWidth;
      return (
        <Fragment>
          <PolyShape
            className={styles('outer')}
            points={[
              [topRightX, topY],
              [topLeftX, topY],
              [center - bottomWidth, bottomY],
              [center + bottomWidth, bottomY],
            ]}
          />
          <PolyLine
            className={styles('inner')}
            points={[
              [topLeftX, topY],
              [topLeftX, bottomY],
              [topRightX, bottomY],
              [topRightX, topY],
            ]}
          />
        </Fragment>
      );
    }
    case 'rotunda': {
      const points = _.take(
        polygonPoints({ n: 12, cx: 100, cy: 150, r: -90 }),
        7,
      );
      const [p1, p2, p3, p4, p5, p6] = points;
      const bottomY = p1[1];
      const q1 = [p3[0], p2[1]];
      const q2 = [p5[0], p6[1]];
      return (
        <Fragment>
          <PolyShape className={styles('outer')} points={points} />
          <PolyShape
            className={styles('inner')}
            points={[[70, bottomY], q1, p4, q2, [130, bottomY]]}
          />
          <PolyLine
            className={styles('inner')}
            points={[p3, q1, [40, bottomY], [160, bottomY], q2, p5]}
          />
        </Fragment>
      );
    }
    default:
      throw new Error('unknown icon type');
  }
}
// PureComponent so we don't rerender when name is the same
export default class OptionIcon extends PureComponent<Props> {
  render() {
    const { name } = this.props;
    return (
      <svg viewBox="0 0 200 200" className={styles('icon')}>
        {drawIcon(name)}
      </svg>
    );
  }
}
