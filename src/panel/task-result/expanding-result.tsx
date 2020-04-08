import React, { useCallback, useState } from 'react';
import { styled } from '@storybook/theming';
import * as Expand from './parts';
import { Button, Icons } from '@storybook/components';
import { useService } from '@xstate/react';
import useRequiredContext from '../../use-required-context';
import ServiceContext from '../service-context';
import { pluraliseCopies, pluraliseSamples } from '../../util/pluralise';
import nextEventsInclude from '../next-events-include';

export type ExpandedArgs = {
  isExpanded: boolean;
};

type Props = {
  taskName: string;
  groupName: string;
  result: React.ReactNode;
  getExpanded: (args: ExpandedArgs) => React.ReactNode;
};

const Container = styled.div`
  --result-border-radius: 4px;
  margin-bottom: var(--grid);
  border: 1px solid lightgray;
  border-radius: var(--result-border-radius);
`;

const HeaderButton = styled.button<{ isExpanded: boolean }>`
  /* reset */
  margin: 0;
  padding: 0;
  border: none;

  width: 100%;
  height: calc(var(--grid) * 4);
  text-align: left;
  font-size: 16px;
  font-weight: bold;
  border-radius: var(--result-border-radius);

  background-color: ${(props) => props.theme.background.content};

  display: flex;
  align-items: center;
  padding: 0 var(--grid);

  > * {
    margin-left: var(--grid);
    flex-shrink: 0;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const Name = styled.h4`
  /* the name will push the result over, it can also collapse when there is no room */
  flex-grow: 1;
  flex-shrink: 1;
  font-weight: bold;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const IconContainer = styled.span`
  width: var(--grid);
  height: var(--grid);
`;

function ExpandIcon({ isExpanded }: ExpandedArgs) {
  return (
    <IconContainer>
      <Icons icon={isExpanded ? 'arrowdown' : 'arrowright'} />
    </IconContainer>
  );
}

export function ExpandingResult({ taskName, groupName, result, getExpanded }: Props) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggle = useCallback(() => setIsExpanded((value) => !value), [setIsExpanded]);
  const service = useRequiredContext(ServiceContext);
  const [state, send] = useService(service);

  const expanded: React.ReactNode = getExpanded({ isExpanded });
  const { copies, samples } = state.context.current;

  return (
    <Container>
      <HeaderButton onClick={toggle} isExpanded={isExpanded}>
        <ExpandIcon isExpanded={isExpanded} />
        <Name>{taskName}</Name>
        {result}
      </HeaderButton>
      {isExpanded ? (
        <Expand.Section>
          {
            // @ts-ignore
            <Button
              secondary
              small
              disabled={!nextEventsInclude('START_ONE', state.nextEvents)}
              onClick={() => send({ type: 'START_ONE', taskName, groupName })}
            >
              Run task{' '}
              <small>
                ({copies} {pluraliseCopies(copies)}, {samples} {pluraliseSamples(samples)})
              </small>
            </Button>
          }
          {expanded}
        </Expand.Section>
      ) : null}
    </Container>
  );
}
