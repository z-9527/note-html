// @ts-ignore
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

import { matchPath } from 'react-router';

enum Action {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE',
}

interface PageType {
  title?: string;
  id?: number;
  render?: any;
  href?: string;
}

// 这个是处理浏览器的前进后退，或go、back等方法的回调
const handlePop = (render: any) => (pages: PageType[]) => {
  // 初始化进入POP
  if (!pages.length) {
    handlePush(render)(pages);
  } else {
    const timeStamp = window.history.state?._timeStamp; // 每个页面push进入时都有一个state

    if (timeStamp < pages[pages.length - 1].id) {
      // 后退
      const lastIndex = _.findLastIndex(pages, { id: timeStamp });
      if (lastIndex > -1) {
        pages.splice(lastIndex + 1);
      } else {
        handlePush(render)(pages);
      }
    } else {
      handlePush(render)(pages);
    }
  }

  return [...pages];
};

const handlePush = (render: any) => (pages: PageType[]) => {
  const id = Date.now();
  const { href } = window.location;

  // react路由已经pushState了，所以这里只是替换一下_timeStamp
  window.history.replaceState(
    { ...window.history.state?.state, _timeStamp: id },
    document.title,
    href,
  );

  pages.push({
    href,
    id,
    render,
  });

  // 最大缓存2个页面，列表->详情
  if (pages.length > 2) {
    pages.shift();
  }

  return [...pages];
};

const handleReplace = (render: any) => (pages: PageType[]) => {
  const id = Date.now();
  const { href } = window.location;

  window.history.replaceState(
    { ...window.history.state?.state, _timeStamp: id },
    document.title,
    href,
  );

  pages[pages.length - 1] = {
    href,
    id,
    render,
  };

  return [...pages];
};

const handlePagesMapAction = {
  POP: handlePop,
  PUSH: handlePush,
  REPLACE: handleReplace,
};

// pages跟着history走，存储每个页面的数据；render阶段只会展示最后一个的页面；
// pop阶段减少pages，放到回收队列里
export const injectStorePages =
  (Component: React.FC | React.ComponentClass) => (props: any) => {
    const [pages, setPages] = useState<PageType[]>([]);

    useEffect(() => {
      return props.history.listen(
        (location: any, action: Action = Action.Pop) => {
          const { history } = props;

          const child = props.children.props.children.find((c: any) =>
            matchPath(location.pathname, c.props),
          );

          if (!child) {
            return;
          }

          const match = matchPath(location.pathname, child.props);

          const render = child.props.render({
            ...props,
            history,
            location,
            match,
          });

          setPages(handlePagesMapAction[action]?.(render)(pages) || []);
        },
      );
    }, []);
    return (
      <Component {...props}>
        {pages.length > 0 &&
          pages.map((p: PageType, idx) => (
            <div
              key={p.id}
              style={{
                display: idx === pages.length - 1 ? 'block' : 'none',
                height: '100%',
              }}
            >
              {p.render}
            </div>
          ))}
      </Component>
    );
  };
