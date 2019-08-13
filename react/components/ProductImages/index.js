import PropTypes from 'prop-types'
import React, { useMemo } from 'react'

import Carousel from './components/Carousel'
import styles from './styles.css'
import { THUMBS_ORIENTATION, THUMBS_POSITION_HORIZONTAL } from './utils/enums'

const ProductImages = ({
  position,
  zoomProps,
  displayThumbnailsArrows,
  images,
  videos,
  thumbnailsOrientation,
}) => {
  const slides = useMemo(() => {
    if (!images.length && !videos.length) return

    return [
      ...images.map(image => ({
        type: 'image',
        url: image.imageUrl,
        alt: image.imageText,
        thumbUrl: image.thumbnailUrl || image.imageUrl,
      })),
      ...videos.map(video => ({
        type: 'video',
        src: video.videoUrl,
        thumbWidth: 300,
      })),
    ]
  }, [images, videos])

  return (
    <div className={`${styles.content} w-100`}>
      <Carousel
        slides={slides}
        position={position}
        displayThumbnailsArrows={displayThumbnailsArrows}
        zoomProps={zoomProps}
        thumbnailsOrientation={thumbnailsOrientation}
      />
    </div>
  )
}

ProductImages.propTypes = {
  /** The position of the thumbs */
  position: PropTypes.oneOf([
    THUMBS_POSITION_HORIZONTAL.LEFT,
    THUMBS_POSITION_HORIZONTAL.RIGHT,
  ]),
  thumbnailsOrientation: PropTypes.oneOf([
    THUMBS_ORIENTATION.VERTICAL,
    THUMBS_ORIENTATION.HORIZONTAL,
  ]),
  /** Array of images to be passed for the Thumbnail Slider component as a props */
  images: PropTypes.arrayOf(
    PropTypes.shape({
      /** URL of the image */
      imageUrls: PropTypes.arrayOf(PropTypes.string.isRequired),
      /** Size thresholds used to choose each image */
      thresholds: PropTypes.arrayOf(PropTypes.number),
      /** URL of the image thumbnail */
      thumbnailUrl: PropTypes.string,
      /** Text that describes the image */
      imageText: PropTypes.string.isRequired,
    })
  ),
}

ProductImages.defaultProps = {
  images: [],
  position: THUMBS_POSITION_HORIZONTAL.LEFT,
  zoomProps: { zoomType: 'in-page' },
  thumbnailsOrientation: THUMBS_ORIENTATION.VERTICAL,
  displayThumbnailsArrows: false,
}

export default ProductImages
