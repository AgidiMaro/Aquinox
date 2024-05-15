import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { RootState } from '../../../state/store';
import { useSelector } from 'react-redux';
import './PageSpinner.scss';

const PageSpinner = () => {

  let showSpinner = useSelector((state: RootState) => state.page.showSpinner);

  return (
    <>
      {
        showSpinner &&
        <div id='page-spinner-wrapper'>
          <div id='page-spinner'>
            <ClipLoader
                color={'#1C73DA'}
                loading={showSpinner}
                size={300}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
          </div>
        </div>
      }
    </>
  );
}

export default PageSpinner;