import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Form,
  Segment,
  Card
} from 'semantic-ui-react'
import moment from 'moment';

import { createRecommendation, deleteRecommendation, getRecommendations } from '../api/recommendations-api'
import Auth from '../auth/Auth'
import { Recommendation } from '../types/Recommendation'

interface RecommendationsProps {
  auth: Auth
  history: History
}

interface RecommendationsState {
  recommendations: Recommendation[];
  loadingRecommendations: boolean;
  newName: string;
  newWhy: string;
}

export class Recommendations extends React.PureComponent<RecommendationsProps, RecommendationsState> {
  state: RecommendationsState = {
    loadingRecommendations: true,
    recommendations: [],
    newName: '',
    newWhy: '',
  }


  handleChange = (e: any, { name, value }: any) => this.setState({ ...this.state, ...{ [name]: value } })

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newName: event.target.value })
  }

  onEditButtonClick = (recommendationId: string) => {
    this.props.history.push(`/recommendations/${recommendationId}/edit`)
  }

  onRecommendationCreate = async () => {
    try {
      const newRecommendation = await createRecommendation(this.props.auth.getIdToken(), {
        name: this.state.newName,
        why: this.state.newWhy,
      })

      this.setState({
        recommendations: [...this.state.recommendations, newRecommendation],
        newName: this.state.newName,
        newWhy: this.state.newWhy
      })
    } catch {
      alert('Recommendation creation failed')
    }
  }

  onRecommendationDelete = async (recommendationId: string) => {
    try {
      await deleteRecommendation(this.props.auth.getIdToken(), recommendationId)
      this.setState({
        recommendations: this.state.recommendations.filter(recommendation => recommendation.recommendationId != recommendationId)
      })
    } catch {
      alert('Recommendation deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const recommendations = await getRecommendations(this.props.auth.getIdToken())
      this.setState({
        recommendations,
        loadingRecommendations: false
      })
    } catch (e) {
      alert(`Failed to fetch recommendations: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">What have you enjoyed recently?</Header>
        {this.renderCreateRecommendationInput()}
        {this.renderRecommendations()}
      </div>
    )
  }

  renderCreateRecommendationInput() {
    const { newName, newWhy } = this.state
    return (
      <Grid.Row>
        <Grid.Column width={16}>
        <Segment inverted >
        <Form inverted onSubmit={() => this.onRecommendationCreate()}>
          <Form.Group>
            <Form.Input
              placeholder='What was it called?'
              name='newName'
              value={newName}
              onChange={this.handleChange}
            />
            <Form.Input
              placeholder='Why did you enjoy it?'
              name='newWhy'
              value={newWhy}
              onChange={this.handleChange}
            />
            <Form.Button content='Submit' />
          </Form.Group>
          </Form>
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderRecommendations() {
    if (this.state.loadingRecommendations) {
      return this.renderLoading()
    }

    return this.renderRecommendationsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Recommendations
        </Loader>
      </Grid.Row>
    )
  }

  renderRecommendationsList() {
    return (
      <Grid padded>
        {this.state.recommendations &&  this.state.recommendations.map((recommendation, pos) => {
          return (
            <Grid.Row key={recommendation.recommendationId}>

              <Card>
                {recommendation.attachmentUrl && (
                  <Image src={recommendation.attachmentUrl} wrapped ui={false} />
                )}
                <Card.Content>
                  <Card.Header>{recommendation.name}</Card.Header>
                  <Card.Description>
                    {recommendation.why}
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <div>
                    {moment(recommendation.createdAt).format('LLLL')}
                  </div>
                  <br />
                  <br />
                  <Button
                    icon
                    onClick={() => this.onEditButtonClick(recommendation.recommendationId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                    icon
                    onClick={() => this.onRecommendationDelete(recommendation.recommendationId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
