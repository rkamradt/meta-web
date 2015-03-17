var $ = require('jquery');
var React = require('react');
var metaAppFactory = require('meta-app');

var commentModel; // filled in when app starts

$.ajax({
  url: 'metadata',
  dataType: 'json',
  success: function(data) {
    console.log('found metadata: ' + data);
    commentModel = metaAppFactory(data).getModel('comments');
    React.render(
      React.createElement(CommentBox, {url: "comments", pollInterval: 2000}),
      document.getElementById('content')
    );
  }.bind(this),
  error: function(xhr, status, err) {
    console.error(this.props.url, status, err.toString());
  }.bind(this)
});

var Comment = React.createClass({displayName: "Comment",
  render: function() {
    var rawMarkup = this.props.children.toString();
    return (
      React.createElement("div", {className: "comment"},
        React.createElement("h2", {className: "commentAuthor"},
          this.props.author
        ),
        React.createElement("span", {}, this.props.children)
      )
    );
  }
});

var CommentBox = React.createClass({displayName: "CommentBox",
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    comment.id = Math.floor(Math.random() * (100000)); // use a random number for a key
    var comments = this.state.data;
    comments.push(comment);
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url + '/' + comment.author,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      React.createElement("div", {className: "commentBox"},
        React.createElement("h1", null, "Comments"),
        React.createElement(CommentList, {data: this.state.data}),
        React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
      )
    );
  }
});

var CommentList = React.createClass({displayName: "CommentList",
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        React.createElement(Comment, {author: comment.author, key: index},
          comment.text
        )
      );
    });
    return (
      React.createElement("div", {className: "commentList"},
        commentNodes
      )
    );
  }
});

var CommentForm = React.createClass({displayName: "CommentForm",
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.author.getDOMNode().value.trim();
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.refs.author.getDOMNode().value = '';
    this.refs.text.getDOMNode().value = '';
  },
  render: function() {
    return (
      React.createElement("form", {className: "commentForm", onSubmit: this.handleSubmit},
        React.createElement("input", {type: commentModel.getProperty('author').getType(), placeholder: "Your email", ref: "author"}),
        React.createElement("input", {type: "text", placeholder: "Say something...", ref: "text"}),
        React.createElement("input", {type: "submit", value: "Post"})
      )
    );
  }
});
