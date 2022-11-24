/**
 * suspense fallback component
 */
import clsx from "clsx";
import type { FC } from "react";

const About: FC = () => {
  return (
    <div className={clsx("mdc-paper")}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-3">关于软件</h1>
        <p className="mdc-text-xs">
          短文本分类工具 | Youth Big Study Statistical Tool
        </p>
        <p className="mdc-text-xs">版本 0.0.1</p>
        <p className="mdc-text-xs">Build 20221123114514</p>
        <p className="mdc-text-xs">© 2022 Mondaycha</p>
      </div>
      <div className="mdc-header flex flex-col">
        <h1 className="mdc-title pb-3">项目地址</h1>
        <div className="grid grid-rows-2 grid-flow-col gap-x-2">
          <a
            href="https://gitee.com/mondaycha/youth-university-learning-statistical-script"
            target="_blank"
            className="mdc-link"
          >
            🔗 在 Gitee 上获取最新版本
          </a>
          <a
            href="https://gitee.com/mondaycha/youth-university-learning-statistical-script"
            target="_blank"
            className="mdc-link"
          >
            🔗 在 Gitee 上查看项目主页
          </a>
          <a
            href="https://gitee.com/mondaycha/youth-university-learning-statistical-script"
            target="_blank"
            className="mdc-link"
          >
            🔗 在 Github 上获取最新版本
          </a>
          <a
            href="https://gitee.com/mondaycha/youth-university-learning-statistical-script"
            target="_blank"
            className="mdc-link"
          >
            🔗 在 Github 上查看项目主页
          </a>
        </div>
      </div>
      <div className="mdc-header">
        <h1 className="mdc-title pb-3">联系开发者</h1>
        <p className="mdc-text-xs">
          如果软件在使用过程中出现问题，或者有新的功能建议，欢迎联系开发者。
        </p>
        <p className="mdc-text-xs">
          您可以通过邮箱 mondaycha@outlook.com 联系开发者。
        </p>
        <p className="mdc-text-xs">
          注：开发者不保证能够及时回复您的邮件，尤其是 2023 年 7 月之后。
        </p>
      </div>
    </div>
  );
};

export default About;
