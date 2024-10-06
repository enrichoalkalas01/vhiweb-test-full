pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        GIT_TOOL = 'Default'
    }

    stages {
        stage('Verify and Pull the Latest Code from Master') {
            steps {
                script {
                    sh '''
                        git --version
                        git fetch origin master
                        git reset --hard origin/master
                        git pull origin master
                    '''
                }
            }
        }

        stage('Rebuild and Deploy Containers') {
            steps {
                script {
                    // Step 1: Stop and remove all existing containers
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE down'

                    // Step 2: Build all containers defined in the docker-compose.yml
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build'

                    // Step 3: Bring up all containers in detached mode
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d'
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    sh 'docker system prune -f'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment berhasil!'
        }

        failure {
            echo 'Deployment gagal!'
        }
        
        always {
            script {
                echo 'Pipeline selesai dijalankan.'
            }
        }
    }
}
