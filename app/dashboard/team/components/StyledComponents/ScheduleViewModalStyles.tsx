import styled from 'styled-components';
import colors from './ColorStyled';

interface ShiftCellProps {
  empty?: boolean;
}

export const ShiftCell = styled.div<ShiftCellProps>`
  flex: 1;
  text-align: center;
  background: ${(props) => (props.empty ? colors.limeGreen : 'transparent')};
  height: auto;
  margin: 0 5px;

  border-radius: 4px;
  cursor: pointer !important;
`;

interface ShiftBlockProps {
  shifttype?: number;
  empty?: boolean;
}

export const ShiftBlock = styled.div<ShiftBlockProps>`
  background: ${(props) => {
    if (props.shifttype === 1) return colors.limeGreen;
    if (props.shifttype === 2) return colors.blue;
    if (props.shifttype === 3) return colors.darkTertiary;
    return colors.limeGreen;
  }};
  color: ${(props) => {
    if (props.shifttype === 2 || props.shifttype === 3) return colors.white;
    return colors.darkPrimary;
  }};
  padding: 8px 4px;
  margin-bottom: 8px;
  border-radius: 25px;
  font-size: 0.6rem;
  font-weight: bold;

  ${(props) =>
    props.empty &&
    `
    background: transparent;
    color: transparent;
  `}
`;
