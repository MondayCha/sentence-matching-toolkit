/**
 * Home page for the application.
 * @see {@link https://dribbble.com/shots/17411788-File-and-asset-management-Untitled-UI}
 * @see {@link https://dribbble.com/shots/18191030-In-Secure-Cloud-storage-dashboard}
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reactLogo from '../../assets/no-file.svg';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import clsx from 'clsx';
import log from '../../middleware/logger';
import { showMessage } from '../../middleware/message';
import { checkCsvAvailability } from '../../api/core';
import moment from 'moment';
import IconLoadFile from './load-file';

const Home = () => {
  const navigate = useNavigate();
  const [filename, setFilename] = useState('');
  const [today] = useState(moment().format('MM-DD'));

  const selectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'CSV',
          extensions: ['csv', 'CSV'],
        },
      ],
    });

    let fullPath = '';
    if (Array.isArray(selected)) {
      fullPath = selected[0];
    } else if (selected === null) {
      // showMessage("没有选择文件", "warning");
      setFilename('');
      return;
    } else {
      fullPath = selected;
    }

    const fileName = decodeURIComponent(new URL(fullPath).pathname.split('/').pop() ?? '');
    log.info(`File selected: ${fileName}`);

    checkCsvAvailability(fullPath)
      .then((res) => {
        const data = res as string;
        log.info(data);
        setFilename(fileName);
      })
      .catch((err) => {
        log.error(err);
        setFilename('');
      });
  };

  return (
    <div className="mdc-paper">
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">短文本分类工具</h1>
        <p className="mdc-text-sm">
          输入本周待统计的全市数据（例如：
          <span className="mr-0.5">{today} 山南.csv</span>
          ）。
        </p>
        <p className="mdc-text-sm">
          软件将根据配置文件
          {filename && <span className="mdc-text-heightlight">{filename}</span>}
          ，输出
          <span className="mdc-text-heightlight">山南市职业技术学校</span>
          的详细学习情况。
        </p>
      </div>
      <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
        <div className="mdc-item py-12 grow">
          <div
            className="flex h-full w-full flex-col items-center justify-center space-y-3 cursor-pointer"
            onClick={selectFile}
          >
            <IconLoadFile />
            <div>
              <p className="mdc-text-sm text-center">
                点击这里，导入需要统计的文件（支持 *.csv 格式）
              </p>
            </div>
          </div>
        </div>
        {filename.length > 0 && <button className="mdc-btn-primary">开始统计</button>}
      </div>
    </div>
  );
};

export default Home;
