import React from 'react';

class RelatedListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [
        {userId: 1, products: [
          {productId: 17762}
          ]
        }
      ]
    }
  }

  render() {
    const {users} = this.state;
    return (
      <div>
        RelatedListContainer
        <div>RelatedProductList</div>
        <div>OutfitList</div>
      </div>
    );
  }
};

export default RelatedListContainer;