/**
 * @fileOverview Default Tooltip Content
 */
import _ from 'lodash';
import React, { PureComponent, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
// @ts-ignore
import { isNumOrStr } from '../util/DataUtils';

function defaultFormatter<T>(value: T) {
  return (_.isArray(value) && isNumOrStr(value[0]) && isNumOrStr(value[1])) ?
    value.join(' ~ ') :
    value
}

export type TooltipType = 'none';
export type ValueType = number | string | Array<number | string>;
export type NameType = number | string;
export type Formatter<TValue extends ValueType, TName extends NameType> = (value: TValue, name: TName, item: Payload<TValue, TName>, index: number) => [ReactNode, ReactNode] | ReactNode

export interface Payload<TValue extends ValueType, TName extends NameType> {
  type?: TooltipType;
  color?: string;
  formatter?: Formatter<TValue, TName>;
  name?: TName;
  value?: TValue;
  unit?: ReactNode;
  dataKey?: string | number;
}

export interface Props<TValue extends ValueType, TName extends NameType> {
  separator?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  formatter?: Function;
  contentStyle?: CSSProperties;
  itemStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  labelFormatter?: (label: any) => ReactNode;
  label?: any;
  payload?: Array<Payload<TValue, TName>>;
  itemSorter?: (item: Payload<TValue, TName>) => number | string;
}

class DefaultTooltipContent<TValue extends ValueType, TName extends NameType> extends PureComponent<Props<TValue, TName>> {
  static displayName = 'DefaultTooltipContent';
  static defaultProps = {
    separator: ' : ',
    contentStyle: {},
    itemStyle: {},
    labelStyle: {},
  };

  renderContent() {
    const { payload, separator, formatter, itemStyle, itemSorter } = this.props;

    if (payload && payload.length) {
      const listStyle = { padding: 0, margin: 0 };

      const items = (itemSorter ? _.sortBy(payload, itemSorter) : payload)
        .map((entry, i) => {
          if (entry.type === 'none') {
            return null;
          }

          const finalItemStyle = {
            display: 'block',
            paddingTop: 4,
            paddingBottom: 4,
            color: entry.color || '#000',
            ...itemStyle,
          };
          const finalFormatter = entry.formatter || formatter || defaultFormatter;
          let { name, value } = entry;
          if (finalFormatter) {
            const formatted = finalFormatter(value, name, entry, i);
            if (Array.isArray(formatted)) {
              [value, name] = formatted;
            } else {
              value = formatted;
            }
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <li className="recharts-tooltip-item" key={`tooltip-item-${i}`} style={finalItemStyle}>
              {isNumOrStr(name) ? <span className="recharts-tooltip-item-name">{name}</span> : null}
              {isNumOrStr(name) ? <span className="recharts-tooltip-item-separator">{separator}</span> : null}
              <span className="recharts-tooltip-item-value">{value}</span>
              <span className="recharts-tooltip-item-unit">{entry.unit || ''}</span>
            </li>
          );
        });

      return <ul className="recharts-tooltip-item-list" style={listStyle}>{items}</ul>;
    }

    return null;
  }

  render() {
    const {
      wrapperClassName,
      contentStyle,
      labelClassName,
      labelStyle,
      label,
      labelFormatter,
    } = this.props;
    const finalStyle: CSSProperties = {
      margin: 0,
      padding: 10,
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      whiteSpace: 'nowrap',
      ...contentStyle,
    };
    const finalLabelStyle = {
      margin: 0,
      ...labelStyle,
    };
    const hasLabel = isNumOrStr(label);
    let finalLabel = hasLabel ? label : '';
    const wrapperCN = classNames('recharts-default-tooltip', wrapperClassName);
    const labelCN = classNames('recharts-tooltip-label', labelClassName);

    if (hasLabel && labelFormatter) { finalLabel = labelFormatter(label); }

    return (
      <div className={wrapperCN} style={finalStyle}>
        <p className={labelCN} style={finalLabelStyle}>{finalLabel}</p>
        {this.renderContent()}
      </div>
    );
  }
}

export default DefaultTooltipContent;
