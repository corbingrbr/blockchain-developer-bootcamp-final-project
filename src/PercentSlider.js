import InputRange from 'react-input-range';

export default function PercentSlider({ handleChange, percent, min }) {
    return (
        <div className='slider custom-labels content-center mb-8 mt-8'>
            <InputRange
                formatLabel={value => value + '%'}
                maxValue={100}
                minValue={min}
                value={percent}
                onChange={handleChange} />
        </div>
    )
}